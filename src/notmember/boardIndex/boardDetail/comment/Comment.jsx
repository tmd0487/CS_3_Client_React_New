import { MoreHorizontal } from "lucide-react";
import styles from "../BoardDetail.module.css";
import { caxios } from "config/config";
import { useNavigate } from "react-router-dom";



// --- 댓글 아이템 컴포넌트 ---
const CommentItem =
    ({ comment, commentMenuOpenId, setCommentMenuOpenId, menuRef, closePostMenu, setPostMenuOpen, setIsReply, setParentCommentId, reloadComments, commentContent, setCommentContent, setIsEdit, setEditCommentId }) => {

        //나의 아이디 스토리지에서 가져오기
        const id = sessionStorage.getItem("id");
        const navigate = useNavigate();

        // 상위 댓글인지 답글인지에 따라 wrapper 및 댓글 박스 클래스 선택
        const wrapperClass = comment.parent_comment_seq
            ? styles.replyCommentWrapper
            : styles.parentCommentWrapper;
        const commentClass = comment.parent_comment_seq
            ? styles.replyComment
            : styles.parentComment;

        // 드롭다운 메뉴 상태
        const isMenuOpen = commentMenuOpenId === comment.comment_seq;

        // 댓글 옵션 메뉴 토글 핸들러
        const handleCommentMenuToggle = (e) => {
            e.stopPropagation();
            closePostMenu();
            setCommentMenuOpenId(isMenuOpen ? null : comment.comment_seq);
        };

        // 댓글 메뉴 항목 클릭 핸들러 : 댓글 수정 삭제
        const handleCommentMenuItemClick = async (e, action, comment_seq, comment_content) => {
            e.stopPropagation();
            setCommentMenuOpenId(null);

            // 삭제 후 즉시 갱신
            if (action === "삭제") {
                if (window.confirm("정말 삭제하시겠습니까?")) {
                    await caxios.delete(`/comment/${comment_seq}`);
                    reloadComments();
                }
            }


            //수정 후 즉시 갱신
            if (action === "수정") {
                setCommentContent(comment_content);  // 입력창에 내용 넣기
                setIsEdit(true);                     // 수정 모드 ON
                setEditCommentId(comment_seq);       // 수정 대상 저장
            }
        };

        //댓글달기 눌렀을때
        const handleReplyClick = (parent_comment_seq) => {
            if (!id || id == "anonymousUser") {
                alert("로그인 후 이용 가능한 서비스 입니다");
                navigate("/login");
                return;
            }

            setIsReply(true);
            setParentCommentId(parent_comment_seq);
            console.log("부모 댓글 시퀀스:", parent_comment_seq);
            setPostMenuOpen(false);
        }

        //날짜포맷
        const formatDate = (datetime) => {
            if (!datetime) return "";
            return datetime.split("T")[0];
        };


        return (
            <div className={wrapperClass} >
                {/* 댓글 박스 */}
                <div className={commentClass}>
                    {/* 댓글 작성자 헤더 */}
                    <div className={styles.commentUserHeader}>
                        <div className={styles.userNicknameBold}>
                            {comment.is_deleted == 1 ? "알 수 없음" : comment.nickname}
                        </div>
                        {/* 댓글 옵션 아이콘 및 드롭다운 메뉴 */}
                        {!comment.is_deleted && id && id !== "anonymousUser" && (
                            <div className={styles.menuContainer}>
                                <MoreHorizontal
                                    size={24}
                                    color="#696b70"
                                    className={styles.commentOptionIcon}
                                    onClick={handleCommentMenuToggle}
                                />
                                {isMenuOpen && (
                                    <div className={styles.dropdownMenu} ref={menuRef}>
                                        {id == comment.user_id ? (
                                            // 내가 작성한 댓글
                                            <>
                                                <button className={styles.menuItem} onClick={(e) => handleCommentMenuItemClick(e, "수정", comment.comment_seq, comment.comment_content)}>
                                                    수정
                                                </button>
                                                <button className={styles.menuItem} onClick={(e) => handleCommentMenuItemClick(e, "삭제", comment.comment_seq, comment.comment_content)}>
                                                    삭제
                                                </button>
                                            </>
                                        ) : (
                                            // 남이 작성한 댓글
                                            <button className={styles.menuItem} onClick={(e) => handleCommentMenuItemClick(e, "신고", comment.comment_seq, comment.comment_content)}>
                                                신고
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}


                    </div>

                    {/* 댓글 본문 */}
                    <div className={styles.commentTextWrapper}>
                        <div className={styles.commentText}>
                            {comment.is_deleted == 1 ? "삭제 된 내용입니다" : comment.comment_content}
                        </div>
                    </div>

                    {/* 댓글 푸터 - 날짜와 답글 버튼 */}
                    <div className={styles.commentFooter}>
                        <div className={styles.commentDate}>{formatDate(comment.created_at)}</div>

                        {!comment.parent_comment_seq && (
                            <div
                                className={styles.replyButton}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleReplyClick(comment.comment_seq);
                                }}>
                                답글 달기
                            </div>
                        )}


                    </div>
                </div>

                {/* 답글이 있으면 재귀적으로 렌더링 */}
                {comment.replies &&
                    comment.replies.map((reply) => (
                        <CommentItem
                            key={reply.comment_seq}
                            comment={reply}
                            commentMenuOpenId={commentMenuOpenId}
                            setCommentMenuOpenId={setCommentMenuOpenId}
                            menuRef={menuRef}
                            closePostMenu={() => setPostMenuOpen(false)}
                            setPostMenuOpen={setPostMenuOpen}
                            setIsReply={setIsReply}
                            setParentCommentId={setParentCommentId}
                            reloadComments={reloadComments}
                            commentContent={commentContent}
                            setIsEdit={setIsEdit}
                            setEditCommentId={setEditCommentId}
                            setCommentContent={setCommentContent}
                        />
                    ))}
            </div>
        );
    };

export default CommentItem;