import React, { useEffect, useState } from 'react';
import Button from './ui/Button';
import { addNewComment, getCommentsByProductId } from '../api/firebase';
import { useAuthContext  } from '../context/AuthContext';
import CommentList from './CommentList';

export default function Comment({ product }) {

    // 댓글 내용
    const [commentText, setCommentText] = useState('');
    // 댓글 목록
    const [comments, setComments] = useState([]);
    // 유저 정보
    const { user } = useAuthContext();

    // 댓글 등록
    const handleCommentSubmit = async () => {
        // 빈 댓글이 아닌 경우일 시 -> 댓글 작성 처리
        if (commentText.trim() !== '') {
            
            try 
            {
                // 새 댓글 작성
                await addNewComment(
                    commentText, 
                    user.uid, 
                    product.id, 
                    user.photoURL, 
                    user.displayName
                );
                
                // 댓글 등록 후 -> 댓글 목록 업데이트 -> 화면 실시간 반영
                const updatedComments = await getCommentsByProductId(product.id);
                // reverse -> 최신 댓글 최상단에 조회
                setComments(updatedComments.reverse()); 
                
                // 댓글 등록 후 -> 댓글 내용 초기화
                setCommentText('');
            
            } 
            
            catch (error) 
            {
                console.error(error);
            }
        }
        
        // 빈 댓글일 시 에러
        else {
            alert('댓글 내용을 입력하세요')
            return;
        }
    };

    useEffect(() => {
        // 댓글 조회
        const fetchComments = async () => {
            try 
            {
                const commentData = await getCommentsByProductId(product.id);
                // 최신 댓글 최상단 조회
                setComments(commentData.reverse()); 
            } 
            catch(error) 
            {
                console.error(error);
            }
        };

        // 컴포넌트 마운트 시 댓글 조회
        fetchComments();

    // 'product.id'가 변경될 때마다 댓글 조회 (다른 제품을 선택하거나 컴포넌트가 처음 렌더링 될 때 product.id가 변경됨)
    }, [product .id]);

    return (
        <div className="comment-container">
            <div>
                <span class="text-red-500 text-4xl">
                    {comments.length}
                </span>개의 댓글
            </div>
            <div className="comment-input-container">
                {/* 댓글 작성 박스 */}
                <input
                    className="comment-input"
                    type="text"
                    placeholder="댓글을 입력하세요..."
                    value={commentText}
                    onChange={ (e) => setCommentText(e.target.value) }
                />
                {/* 댓글 등록 버튼 */}
                <Button 
                    text={'등록'} 
                    className="comment-submit-button" 
                    onClick={handleCommentSubmit} 
                />
            </div>
            
            {comments.length === 0 ? (
                <p>
                    <span style={{ fontSize: '18px', fontWeight: 'bold' }}>아직 댓글이 없습니다.</span> <br />
                    <span>가장 먼저 댓글을 남겨보세요.</span>
                </p>
            ) : (
                // 댓글 목록
                <CommentList
                    product={product} 
                    comments={comments} 
                />
            )}
        </div>
    );
}