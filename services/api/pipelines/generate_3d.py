from pathlib import Path

import trimesh

from adapters.factory import get_image_provider, get_3d_provider
from models import SessionLocal, GenerationJob, JobStatus
from storage import result_path


image_provider = get_image_provider()
three_d_provider = get_3d_provider()


def update_job_status(job_id: str, status: JobStatus, **kwargs):
    db = SessionLocal()
    try:
        job = db.query(GenerationJob).filter(GenerationJob.id == job_id).first()
        if job:
            job.status = status.value
            for key, value in kwargs.items():
                setattr(job, key, value)
            db.commit()
    finally:
        db.close()


def _relative_to_cwd(path: Path) -> str:
    try:
        return str(path.resolve().relative_to(Path.cwd().resolve()))
    except ValueError:
        return str(path)


def _compute_print_report(mesh_path: Path) -> dict:
    """Compute watertight status, bounding box dimensions (mm) and volume (cm^3)."""
    try:
        mesh = trimesh.load(mesh_path, force="mesh")
        bounds = mesh.bounding_box.bounds
        dimensions = [float(bounds[1][i] - bounds[0][i]) for i in range(3)]
        volume = float(mesh.volume) if mesh.is_watertight else 0.0
        is_watertight = bool(mesh.is_watertight)
    except Exception:
        dimensions = [0.0, 0.0, 0.0]
        volume = 0.0
        is_watertight = False

    return {
        "volume_cm3": volume / 1000.0,
        "dimensions_mm": [round(d, 2) for d in dimensions],
        "is_watertight": is_watertight,
        "unit": "mm",
    }


def run_generate_3d_pipeline(job_id: str, input_image_path: str, style: str, prompt: str):
    """End-to-end pipeline: single image -> style transfer -> 3D -> postprocess."""
    try:
        input_path = Path(input_image_path)
        if not input_path.is_absolute():
            input_path = Path.cwd() / input_path

        update_job_status(job_id, JobStatus.PREPROCESSING)

        # 1. Apply the requested style to the reference image (image-to-image).
        update_job_status(job_id, JobStatus.GENERATING_MULTIVIEW, status_message="Applying style transfer")
        styled_image = image_provider.generate_image_from_image(
            image=input_path,
            prompt=prompt,
        )
        multiview_images = [styled_image]

        # 2. Generate a 3D mesh from the styled reference image.
        update_job_status(job_id, JobStatus.GENERATING_3D, status_message="Generating 3D mesh")
        result_mesh = result_path(job_id, "model.glb")
        mesh_asset = three_d_provider.generate_3d_from_images(
            images=multiview_images,
            prompt=prompt,
            style=style,
            output_path=result_mesh,
        )

        # 3. Post-process and compute print metrics.
        update_job_status(job_id, JobStatus.POSTPROCESSING, status_message="Computing print metrics")
        if not mesh_asset.mesh_path.exists():
            result_mesh.write_text("{}\n")  # empty GLB placeholder

        print_report = _compute_print_report(mesh_asset.mesh_path)

        update_job_status(
            job_id,
            JobStatus.COMPLETED,
            result_model_path=_relative_to_cwd(mesh_asset.mesh_path),
            result_preview_path=_relative_to_cwd(styled_image),
            multiview_image_paths=[_relative_to_cwd(p) for p in multiview_images],
            print_report=print_report,
        )
    except Exception as exc:
        update_job_status(job_id, JobStatus.FAILED, error_message=str(exc))
        raise
