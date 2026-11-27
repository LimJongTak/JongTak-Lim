"""
포트폴리오 사진 전체 처리 스크립트
- 프로젝트 커버 이미지 (순덕방, 페달아이)
- 프로젝트 갤러리 이미지 (순덕방 PDF 슬라이드, 페달아이 스크린샷)
- 활동 사진 (포트폴리오 사진/ 폴더 전체)
"""
import os, sys, shutil
sys.stdout.reconfigure(encoding='utf-8')

from PIL import Image
import pymupdf

ROOT   = "D:/JongTak-Lim"
CLIENT = f"{ROOT}/client/public/images"
SERVER = f"{ROOT}/server/public/images"

MAX_W  = 1600   # 긴 변 최대
COVER_W = 1200  # 커버 이미지 최대

def to_webp(src_path, dst_path, max_dim=MAX_W, quality=85):
    os.makedirs(os.path.dirname(dst_path), exist_ok=True)
    img = Image.open(src_path).convert("RGB")
    w, h = img.size
    if max(w, h) > max_dim:
        ratio = max_dim / max(w, h)
        img = img.resize((int(w * ratio), int(h * ratio)), Image.LANCZOS)
    img.save(dst_path, "WEBP", quality=quality)
    print(f"  → {dst_path.replace(ROOT, '')}")

def sync_server(rel_path):
    """client/public → server/public 동기화"""
    src = f"{CLIENT}/{rel_path}"
    dst = f"{SERVER}/{rel_path}"
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    shutil.copy2(src, dst)

def process_folder(src_dir, dst_rel, max_dim=MAX_W, limit=None):
    """폴더 내 이미지를 WebP로 변환해서 dst_rel에 저장. 파일명은 01.webp, 02.webp ..."""
    exts = {'.jpg','.jpeg','.png','.webp','.bmp','.heic','.heif'}
    files = sorted([f for f in os.listdir(src_dir) if os.path.splitext(f)[1].lower() in exts])
    if limit:
        files = files[:limit]
    results = []
    for i, fname in enumerate(files, 1):
        src = os.path.join(src_dir, fname)
        rel = f"{dst_rel}/{i:02d}.webp"
        to_webp(src, f"{CLIENT}/{rel}", max_dim=max_dim)
        sync_server(rel)
        results.append(rel)
    return results

def pdf_to_images(pdf_path, dst_rel, pages=None, scale=2.0):
    """PDF 페이지를 WebP로 렌더링"""
    doc = pymupdf.open(pdf_path)
    total = doc.page_count
    page_nums = pages if pages else range(total)
    results = []
    for i, pn in enumerate(page_nums, 1):
        page = doc[pn]
        mat  = pymupdf.Matrix(scale, scale)
        pix  = page.get_pixmap(matrix=mat)
        import io
        from PIL import Image as PILImg
        img  = PILImg.open(io.BytesIO(pix.tobytes('png'))).convert("RGB")
        rel  = f"{dst_rel}/{i:02d}.webp"
        dst  = f"{CLIENT}/{rel}"
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        img.save(dst, "WEBP", quality=85)
        sync_server(rel)
        print(f"  PDF p{pn+1} → {rel}")
        results.append(rel)
    return results

# ─── 1. 프로젝트 커버 이미지 ───────────────────────────────────────
print("\n[ 1. 프로젝트 커버 이미지 ]")

# 순덕방 커버 (자기활동소개서 사진에서)
to_webp("D:/자기활동소개서 사진/순덕방.PNG", f"{CLIENT}/sundukbang.webp", max_dim=COVER_W)
sync_server("sundukbang.webp")

# 페달아이 커버 (Pedaleye.png 고화질로 교체)
to_webp("D:/pedaleye/Pedaleye.png", f"{CLIENT}/pedaleye.webp", max_dim=COVER_W)
sync_server("pedaleye.webp")

# ─── 2. 순덕방 갤러리 (PDF 슬라이드) ──────────────────────────────
print("\n[ 2. 순덕방 PDF 슬라이드 → 갤러리 ]")
# 의미 있는 페이지만 (p3~p11, 타이틀/목차 제외)
sunduk_pages = pdf_to_images(
    "D:/순덕방 졸작 발표.pdf",
    "activities/sundukbang",
    pages=list(range(2, 11)),  # p3~p11 (0-indexed: 2~10)
    scale=2.0
)

# ─── 3. 페달아이 갤러리 (스크린샷 14장) ───────────────────────────
print("\n[ 3. 페달아이 스크린샷 갤러리 ]")
pedal_imgs = process_folder("D:/pedaleye/Pedaleye", "activities/pedaleye", limit=12)

# ─── 4. 활동 사진 폴더 전체 처리 ─────────────────────────────────
print("\n[ 4. 활동 사진 처리 ]")

PORTFOLIO_DIR = "D:/포트폴리오 사진"

activity_map = {
    "u300 학생창업유망팀":        ("activities/startup-300",       10),
    "대학생 재능봉사 캠프":        ("activities/talent-camp-2023",   8),
    "대학생청소년교육지원 멘토":    ("activities/youth-mentor",       6),
    "멋쟁이사자처럼":             ("activities/likelion",           8),
    "순천 AI 미래 도시 전략 포럼":  ("activities/ai-forum",           8),
    "외국인 유학생 멘토링":        ("activities/foreign-mentor",     6),
    "전공 TA 조교":              ("activities/ta-assistant",       4),
    "지역현안문제해결":           ("activities/local-issue",        8),
    "총학생회 부회장":            ("activities/student-council",    8),
    "컴퓨터공학과 학생회장":       ("activities/cs-council",         6),
    "코딩 동아리 코마 회장":       ("activities/coding-club",        6),
    "풍운재자 청년정책발굴추진단":  ("activities/youth-policy",       6),
    "한국장학재단 NH농협은행 재능봉사": ("activities/nh-volunteer",  6),
}

activity_results = {}
for folder_name, (dst_rel, limit) in activity_map.items():
    src_dir = os.path.join(PORTFOLIO_DIR, folder_name)
    if not os.path.isdir(src_dir):
        print(f"  skip (없음): {folder_name}")
        continue
    files = [f for f in os.listdir(src_dir) if os.path.splitext(f)[1].lower() in {'.jpg','.jpeg','.png','.webp'}]
    if not files:
        print(f"  skip (사진 없음): {folder_name}")
        continue
    print(f"\n  {folder_name} ({len(files)}장)")
    imgs = process_folder(src_dir, dst_rel, limit=limit)
    activity_results[folder_name] = imgs

# NH봉사 사진 (NH재봉 폴더)
print("\n  NH재봉 사진")
nh_dir = "D:/NH재봉/NH재봉/사진"
if os.path.isdir(nh_dir):
    nh_imgs = process_folder(nh_dir, "activities/nh-talent-camp-2025", limit=8)
    activity_results["NH재능봉사_2025"] = nh_imgs

print("\n\n=== 처리 완료 ===")
print(f"순덕방 커버: /images/sundukbang.webp")
print(f"페달아이 커버: /images/pedaleye.webp")
print(f"순덕방 갤러리: {sunduk_pages}")
print(f"페달아이 갤러리: {len(pedal_imgs)}장")
for k, v in activity_results.items():
    print(f"{k}: {len(v)}장")
