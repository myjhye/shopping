import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { deleteComment, getCommentsByProductId, hasUserLiked, likeComment } from '../api/firebase';
import CommentEdit from './CommentEdit';
import { LuThumbsUp } from 'react-icons/lu';
import { BsFillHandThumbsUpFill } from 'react-icons/bs';

// 댓글 목록
export default function CommentList({ comments }) {

    const { uid } = useAuthContext();

    // (수정될) 댓글 목록
    const [commentList, setCommentList] = useState(comments);
    // 수정할 댓글 ID
    const [editingCommentId, setEditingCommentId] = useState('');
    // 각 댓글에 대한 좋아요 상태
    const [likedComments, setLikedComments] = useState({});

    // 댓글 삭제 핸들러
    const handleDeleteComment = async (commentId, productId) => {
        
        // commentId -> 댓글 삭제용 , productId -> 댓글 조회용

        // async 비동기 작업 -> 댓글 삭제 후 댓글 조회 -> 이 두 작업을 순서대로 처리하기 위해 async 사용

        if (window.confirm('삭제하시겠습니까?')) {
            
            try 
            {
                //** 댓글 삭제 처리
                await deleteComment(commentId);

                // 댓글 삭제 후 -> 댓글 목록 업데이트 -> 화면 실시간 반영
                const updatedComments = await getCommentsByProductId(productId);
                // reverse -> 최신 댓글 최상단에 조회
                setCommentList(updatedComments.reverse());
            } 
            catch (error) 
            {
                console.error(error);
            }
        }

    };


    // 댓글 수정 핸들러
    const handleEditButtonClick = (commentId) => {
        
        // setEditingCommentId에 매개변수 commentId를 주입 -> 댓글 수정 클릭 -> 해당 댓글의 commentId와 일치 -> 댓글 수정 창 오픈
        setEditingCommentId(commentId); 
    };




    // 댓글 좋아요 클릭
    const handleLikeButtonClick = async (commentId, productId) => {

        if (likedComments[commentId]) {
            alert('이미 참여하셨습니다');
            return;
        }

        try {
            // 좋아요 클릭
            await likeComment(commentId, uid);

            // 좋아요 증가 후 댓글 목록 업데이트
            const updatedComments = await getCommentsByProductId(productId);
            // 최신 댓글 최상단에 조회
            setCommentList(updatedComments.reverse());

            setLikedComments((prevState) => ({
                ...prevState,
                [commentId]: true,
            }));
        } catch (error) {
            console.error('좋아요 업데이트 오류: ', error);
        }

    }

    useEffect(() => {
        const checkUserLikes = async() => {
            const newLikedComments = {};
            for (const comment of comments) {
                const hasLiked = await hasUserLiked(comment.id, uid);
                newLikedComments[comment.id] = hasLiked;
            }
            setLikedComments(newLikedComments);
        };
        checkUserLikes();
    }, [comments, uid]);

    // comments 배열이 변경 될 때마다(새 댓글이 입력 될 때마다) 댓글 목록 업데이트 -> commentList를 comments 배열과 동일하게 설정
    useEffect(() => {
        setCommentList(comments);
    }, [comments]);


    return (
        <div className="comment-list">
            {commentList.map((comment, index) => (
                <div className="comment-item" key={index}>
                    <div className="comment-item flex items-center space-x-2 mb-2 border-0">
                        <img
                            className="w-10 h-10 rounded-full mr-0" 
                            src={comment.userPhotoUrl} 
                        />
                        <p style={{ color: '#F96162' }}>{comment.userName}</p>
                        <p>{comment.date}</p>

                        {/* 수정/삭제 버튼 (현재 사용자만 조회) */}
                        {comment.userId === uid && (
                            <div className="ml-auto flex space-x-2">
                                <button onClick={() => handleEditButtonClick(comment.id)}>수정</button>
                                <button onClick={() => handleDeleteComment(comment.id, comment.productId)}>삭제</button>
                            </div>
                        )}

                        <button 
                            onClick={() => handleLikeButtonClick(comment.id, comment.productId)}
                        >
                           {likedComments[comment.id] ? <BsFillHandThumbsUpFill /> : <LuThumbsUp />}
                        </button>
                            { comment.likes }

                    </div>
                    <div className="ml-8">
                        {/* 기존 댓글 텍스트 */}
                        <p>{comment.text}</p> 
                        
                        {/* 댓글 수정 박스 */}
                        {/* 댓글 수정 클릭 -> setEditingCommentId의 commentId와 해당 댓글의 commentId가 일치 -> 댓글 수정 박스 오픈 */}
                        {editingCommentId === comment.id && (
                            <CommentEdit 
                                comment={comment}
                                commentList={commentList}
                                setCommentList={setCommentList} 
                                setEditingCommentId={setEditingCommentId} 
                            />
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}