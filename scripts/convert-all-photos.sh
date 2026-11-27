#!/bin/bash
# Convert all portfolio photos to WebP and place in correct activity folders

FFMPEG="/c/Users/User/AppData/Local/Microsoft/WinGet/Links/ffmpeg"
PHOTOS="D:/포트폴리오 사진"
DIST="D:/JongTak-Lim/client/dist/images/activities"
PUB="D:/JongTak-Lim/server/public/images/activities"

convert() {
  local src="$1"
  local dst_base="$2"
  local num="$3"
  local dst_dist="${DIST}/${dst_base}/${num}.webp"
  local dst_pub="${PUB}/${dst_base}/${num}.webp"

  mkdir -p "${DIST}/${dst_base}" "${PUB}/${dst_base}"

  # If source is already WebP, just copy and resize
  if [[ "$src" == *.webp ]]; then
    "$FFMPEG" -i "$src" -vf "scale='min(1600,iw)':-2" -c:v libwebp -quality 80 -y "$dst_dist" 2>/dev/null && \
    cp "$dst_dist" "$dst_pub" && echo "  ✔ $num ($dst_base)"
  else
    "$FFMPEG" -i "$src" -vf "scale='min(1600,iw)':-2" -c:v libwebp -quality 80 -y "$dst_dist" 2>/dev/null && \
    cp "$dst_dist" "$dst_pub" && echo "  ✔ $num ($dst_base)"
  fi
}

echo "=== FairyTale 대동제 축제 ==="
convert "$PHOTOS/총학생회 부회장/FairyTale 대동제 축제 관련/축제 준비 과정/1746781623775.jpg" "scnu-festival-2025" "01"
convert "$PHOTOS/총학생회 부회장/FairyTale 대동제 축제 관련/축제 당일/1748482287270.jpg" "scnu-festival-2025" "02"
convert "$PHOTOS/총학생회 부회장/FairyTale 대동제 축제 관련/축제 당일/20250528_214104.jpg" "scnu-festival-2025" "03"
convert "$PHOTOS/총학생회 부회장/FairyTale 대동제 축제 관련/축제 당일/1749035681111.jpg" "scnu-festival-2025" "04"

echo "=== 총학생회 부총학생회장 ==="
convert "$PHOTOS/총학생회 부회장/총학생회 선거 출마 관련/임종탁_후보님_1.jpg" "student-council" "01"
convert "$PHOTOS/총학생회 부회장/총학생회 선거 출마 관련/1734143014214.jpg" "student-council" "02"
convert "$PHOTOS/총학생회 부회장/전체간부수련회/20250204_210324.jpg" "student-council" "03"
convert "$PHOTOS/총학생회 부회장/신입생 OT/1739860929454-11.jpg" "student-council" "04"
convert "$PHOTOS/총학생회 부회장/이음 상권활성화 프로젝트/20250509_161105.jpg" "student-council" "05"
convert "$PHOTOS/총학생회 부회장/이음 상권활성화 프로젝트/20250520_162708.jpg" "student-council" "06"

echo "=== 컴퓨터공학과 학생회장 ==="
convert "$PHOTOS/컴퓨터공학과 학생회장/MT/1679809107256-0.jpg" "cs-council" "01"
convert "$PHOTOS/컴퓨터공학과 학생회장/단과대학 운영위원회/1684057740933-0.jpg" "cs-council" "02"
convert "$PHOTOS/컴퓨터공학과 학생회장/견학 행사/1698963422283.jpg" "cs-council" "03"
convert "$PHOTOS/컴퓨터공학과 학생회장/오픈캠퍼스 중고등학생 전공 특강/20240502_111048.jpg" "cs-council" "04"
convert "$PHOTOS/컴퓨터공학과 학생회장/봉사활동/지역아동센터 전공프로그램 교육.jpg" "cs-council" "05"

echo "=== 멋쟁이사자처럼 (12기·13기) ==="
convert "$PHOTOS/멋쟁이사자처럼/1717235093030.jpg" "likelion" "01"
convert "$PHOTOS/멋쟁이사자처럼/Screenshot_20240601_162351_KakaoTalk.jpg" "likelion" "02"
convert "$PHOTOS/멋쟁이사자처럼/1722968848651.jpg" "likelion" "03"
convert "$PHOTOS/멋쟁이사자처럼/20240806_200053.jpg" "likelion" "04"
convert "$PHOTOS/멋쟁이사자처럼/1726551231406.png" "likelion" "05"

echo "=== 지역현안문제해결 ==="
convert "$PHOTOS/지역현안문제해결/기업 미팅/1770740184827.jpg" "local-issue" "01"
convert "$PHOTOS/지역현안문제해결/외국인 비건 햄 시식 및 사전 조사/20251129_151758.jpg" "local-issue" "02"
convert "$PHOTOS/지역현안문제해결/발표/AISelect_20261124_003536_Gallery.jpg" "local-issue" "03"
convert "$PHOTOS/지역현안문제해결/기업 미팅/20251026_155550.jpg" "local-issue" "04"
convert "$PHOTOS/지역현안문제해결/발표/AISelect_20261124_003549_Gallery.jpg" "local-issue" "05"

echo "=== 코딩 동아리 코마 ==="
convert "$PHOTOS/코딩 동아리 코마 회장/20240408_210001.jpg" "coding-club" "01"
convert "$PHOTOS/코딩 동아리 코마 회장/20240503_140750.jpg" "coding-club" "02"

echo "=== u300 학생창업유망팀 ==="
convert "$PHOTOS/u300 학생창업유망팀/20250820_104825.jpg" "startup-300" "01"
convert "$PHOTOS/u300 학생창업유망팀/IMG_20250820_105947_182.webp" "startup-300" "02"

echo "=== 대학생청소년교육지원 멘토 ==="
convert "$PHOTOS/대학생청소년교육지원 멘토/20250711_162337.jpg" "youth-mentor" "01"
convert "$PHOTOS/대학생청소년교육지원 멘토/20250711_162338.jpg" "youth-mentor" "02"

echo "=== 외국인 유학생 멘토링 ==="
convert "$PHOTOS/외국인 유학생 멘토링/20240521_153845.jpg" "foreign-mentor" "01"
convert "$PHOTOS/외국인 유학생 멘토링/20240521_153917(0).jpg" "foreign-mentor" "02"

echo "=== 전공 TA 조교 ==="
convert "$PHOTOS/전공 TA 조교/20240605_150610.jpg" "ta-assistant" "01"
convert "$PHOTOS/전공 TA 조교/20240605_150618.jpg" "ta-assistant" "02"

echo ""
echo "Done!"
