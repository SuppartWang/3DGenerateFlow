from pydantic import BaseModel
from typing import Literal


class StyleTemplate(BaseModel):
    id: str
    name: str
    description: str
    category: Literal["3d", "relief_2d5", "stylized_3d"]
    output_mode: Literal["fullcolor_3d", "relief_2d5"]
    style_prompt: str
    negative_prompt: str = ""
    postprocess_params: dict = {}
    sample_image_url: str = ""


STYLE_CATALOG: list[StyleTemplate] = [
    # 全彩 3D 风格
    StyleTemplate(
        id="realistic_3d",
        name="写实 3D",
        description="高还原度、照片级真实感，适合人物、宠物、物品纪念品",
        category="3d",
        output_mode="fullcolor_3d",
        style_prompt="photorealistic 3D model, highly detailed, faithful to reference, soft natural lighting, clean background",
        postprocess_params={"wall_thickness_mm": 2.0, "target_height_mm": 80},
    ),
    StyleTemplate(
        id="cartoon_3d",
        name="卡通 3D",
        description="大眼睛、圆润比例、高饱和度，适合宠物/儿童/IP 形象",
        category="3d",
        output_mode="fullcolor_3d",
        style_prompt="cute 3D cartoon character, chibi style, smooth rounded shapes, vibrant colors, glossy material, clean background",
        postprocess_params={"wall_thickness_mm": 2.0, "target_height_mm": 60},
    ),
    StyleTemplate(
        id="lowpoly_3d",
        name="低多边形 3D",
        description="几何切面、低面艺术、适合桌面摆件与装饰",
        category="3d",
        output_mode="fullcolor_3d",
        style_prompt="low poly 3D art, faceted geometric surfaces, vibrant flat colors, minimal details, stylized",
        postprocess_params={"wall_thickness_mm": 2.5, "target_height_mm": 70, "decimate_ratio": 0.3},
    ),
    StyleTemplate(
        id="voxel_3d",
        name="体素 3D",
        description="像素方块堆叠风格，类似 Minecraft/Voxel 艺术",
        category="stylized_3d",
        output_mode="fullcolor_3d",
        style_prompt="voxel art 3D model, made of small cubes, Minecraft style, bright colors, blocky silhouette",
        postprocess_params={"wall_thickness_mm": 2.0, "target_height_mm": 64},
    ),
    StyleTemplate(
        id="clay_3d",
        name="粘土 3D",
        description="柔软粘土/陶土质感，适合手作感纪念品",
        category="stylized_3d",
        output_mode="fullcolor_3d",
        style_prompt="claymation 3D model, soft clay texture, fingerprint details, matte material, warm studio lighting",
        postprocess_params={"wall_thickness_mm": 2.5, "target_height_mm": 70},
    ),
    StyleTemplate(
        id="sketch_3d",
        name="素描 3D",
        description="铅笔线条/雕刻白模风格，适合艺术摆件",
        category="stylized_3d",
        output_mode="fullcolor_3d",
        style_prompt="3D model in pencil sketch style, contour lines, monochrome, artistic sculpture look, clean background",
        postprocess_params={"wall_thickness_mm": 2.0, "target_height_mm": 75},
    ),
    # 2.5D 浮雕风格
    StyleTemplate(
        id="relief_embossed",
        name="2.5D 浮雕",
        description="从照片生成凸起的浮雕，适合做奖牌、纪念牌、冰箱贴",
        category="relief_2d5",
        output_mode="relief_2d5",
        style_prompt="embossed relief, high contrast grayscale depth map, smooth gradients, portrait or object centered, no background",
        postprocess_params={"base_thickness_mm": 3.0, "relief_height_mm": 4.0, "invert": False},
    ),
    StyleTemplate(
        id="relief_lithophane",
        name="透光浮雕（Lithophane）",
        description="根据照片厚度变化透光，适合用浅色树脂/PLA 打印",
        category="relief_2d5",
        output_mode="relief_2d5",
        style_prompt="lithophane height map, grayscale, high contrast, portrait centered, backlit ready, no color",
        postprocess_params={"base_thickness_mm": 0.5, "relief_height_mm": 3.0, "invert": False},
    ),
    StyleTemplate(
        id="relief_coin",
        name="纪念币/硬币浮雕",
        description="圆形底座、金属质感，适合做纪念币或钥匙扣",
        category="relief_2d5",
        output_mode="relief_2d5",
        style_prompt="coin medallion relief, circular frame, high contrast depth map, metallic look, centered portrait or emblem",
        postprocess_params={"base_thickness_mm": 2.0, "relief_height_mm": 1.5, "shape": "circular", "invert": False},
    ),
    StyleTemplate(
        id="relief_silhouette",
        name="剪影浮雕",
        description="强轮廓剪影风格，适合做挂件、装饰板",
        category="relief_2d5",
        output_mode="relief_2d5",
        style_prompt="silhouette relief, strong outer contour, minimal internal details, flat layers, high contrast depth map",
        postprocess_params={"base_thickness_mm": 2.0, "relief_height_mm": 2.5, "invert": False},
    ),
]

STYLE_MAP = {s.id: s for s in STYLE_CATALOG}


def get_style(style_id: str) -> StyleTemplate:
    if style_id not in STYLE_MAP:
        return STYLE_MAP["realistic_3d"]
    return STYLE_MAP[style_id]


def list_styles() -> list[StyleTemplate]:
    return STYLE_CATALOG
