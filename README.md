# Cyworld Club Grep

## 무엇인가요?
싸이월드 클럽을 추출해서 json 으로 저장하는 스크립트입니다.

## 저작권
MIT 라이센서를 따릅니다.
변경 및 재배포는 자유입니다! 
다만 원 라이센스의 github 경로는 명시해주세요.

## 필요한것은?
- node.js
- npm modules
 - http
 - https
 - querystring
 - async
 - crypto
 - stream
 - fs
 - iconv-lite
 - cheerio
 - html-entities
 
## 설정은
 - core/config.js 에서 아래의 항목을 수정하여 주세요!!
   - userId : 싸이월드 아이디
   - password : 싸이월드 패스워드
   - clubId : 싸이월드 클럽아이디 (ex: http://club.cyworld.com/ClubV1/Home.cy/52172895 -> 52172895 만 작성)
 
## 실행은
순차적으로 실행 부탁 드리겠습니다.
 
    node 01_articleListGrep.js // 전체 글보기 리스트 파일로 저장
    node 02_articleViewGrep.js // 전체 글보기 게시물 파일로 저장
    node 03_galleryListGrep.js // 전체 사진보기 리스트 파일로 저장
    node 04_galleryViewGrep.js // 전체 사진보기 게시물 파일로 저장
    node 05_sketchListGrep.js // 그리기 리스트 파일로 저장 (없으면 무시해도 됨)
    node 06_sketchViewGrep.js // 그리기 게시물 파일로 저장 (없으면 무시해도 됨)
    node 07_commentGrep.js // 모든 게시물 댓글 파일로 저장
    node 08_imageQueueGrep.js // 게시물내 첨부 이미지 저장 준비
    node 09_imageGrep.js // 첨부 이미지 다운로드
    node 10_freetalkGrep.js // 프리톡 리스트 파일로 저장 (ASP.NET 인 관계로 페이징은 자동저장되지 않습니다. 번거롭지만 pageNo 변수를 직접 수정 부탁드립니다)
    node 11_freetalkCommentGrep.js // 프리톡 댓글 파일로 저장 (실험중 / 69~77 라인을 직접 실행하시면 실행되십니다. 세션마다 다른 값을 가지는 관계로.... 수정이 힘들것 같습니다)