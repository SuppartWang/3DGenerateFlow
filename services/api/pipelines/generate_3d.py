from pathlib import Path

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


def run_generate_3d_pipeline(job_id: str, input_image_path: str, style: str, prompt: str):
    """End-to-end pipeline: single image -> multiview -> 3D -> postprocess."""
    try:
        input_path = Path(input_image_path)
        if not input_path.is_absolute():
            input_path = Path.cwd() / input_path

        update_job_status(job_id, JobStatus.PREPROCESSING)

        update_job_status(job_id, JobStatus.GENERATING_MULTIVIEW)
        multiview_images = image_provider.generate_multiview_from_image(
            image=input_path, prompt=prompt, num_views=4
        )

        update_job_status(job_id, JobStatus.GENERATING_3D)
        result_mesh = result_path(job_id, "model.glb")
        mesh_asset = three_d_provider.generate_3d_from_images(
            images=multiview_images,
            prompt=prompt,
            style=style,
            output_path=result_mesh,
        )

        update_job_status(job_id, JobStatus.POSTPROCESSING)
        # Placeholder postprocess: ensure file exists; real code will repair/manifold/uv bake.
        if not mesh_asset.mesh_path.exists():
            result_mesh.write_text("{}\n")  # empty GLB placeholder

        update_job_status(
            job_id,
            JobStatus.COMPLETED,
            result_model_path=_relative_to_cwd(mesh_asset.mesh_path),
            multiview_image_paths=[_relative_to_cwd(p) for p in multiview_images],
            print_report={"volume_cm3": 0.0, "dimensions_mm": [0, 0, 0]},
        )
    except Exception as exc:
        update_job_status(job_id, JobStatus.FAILED, error_message=str(exc))
        raise
