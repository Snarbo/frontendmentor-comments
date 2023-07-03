import { useState, useEffect } from 'react';

import Modal from '../Utils/Modal';
import Comment from './Comments';
import Classes from './Comments.module.css';

const CommentsGroup = () => {
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState();
  const [currentUser, setCurrentUser] = useState([]);
  const [comments, setComments] = useState([]);
  const [commentIds, setCommentIds] = useState([]);
  const [postText, setPostText] = useState('');
  const [commentIdToRemove, setCommentIdToRemove] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  const API = 'https://react-comments-de644-default-rtdb.firebaseio.com/commentItems';

  useEffect(() => {
    const fetchItems = async () => {
      const res = await fetch(API + '.json');

      if (!res.ok) {
        throw new Error('Comments failed to load.');
      }

      const resData = await res.json();

      setCurrentUser(resData.currentUser);
      setComments(resData.comments);
      setIsLoading(false);
    };

    fetchItems().catch((error) => {
      setIsLoading(false);
      setError(error.message);
    });
  }, []);

  useEffect(() => {
    const flattenComments = (commentsArr) => {
      let ids = [];
      commentsArr.forEach((comment) => {
        ids.push(comment.id);
        if (comment.replies && comment.replies.length > 0) {
          const nestedIds = flattenComments(comment.replies);
          ids = [...ids, ...nestedIds];
        }
      });
      return ids;
    };

    const ids = flattenComments(comments);
    setCommentIds(ids);
  }, [comments]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 700);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const generateUniqueReplyId = () => {
    const maxId = Math.max(...commentIds);
    return maxId + 1;
  };

  const handlePostText = (e) => {
    setPostText(e.target.value);
  };

  function findParentId(nestedArray, targetId, parentId = null) {
    for (let item of nestedArray) {
      if (item.id === targetId) {
        parentId = item.id;
      }

      const replies = item.replies;
      if (replies && replies.length > 0) {
        for (let reply of replies) {
          if (reply.id === targetId) {
            parentId = item.id;
          }
        }
      }
    }

    return parentId;
  }

  const handleControlData = (id, action, newScore, replyTo, replyText, editedText) => {
    const parentId = findParentId(comments, id);
    const newId = generateUniqueReplyId();
    let updatedComments;

    switch (action) {
      case 'score':
        updatedComments = comments.map((comment) => {
          if (comment.id === parentId) {
            if (parentId === id) {
              return {
                ...comment,
                score: newScore,
              };
            }

            comment.replies = comment.replies.map((reply) => {
              if (reply.id === id) {
                return {
                  ...reply,
                  score: newScore,
                };
              }
              return reply;
            });
          }

          return comment;
        });

        break;

      case 'post':
        if (postText === '') {
          alert('Text cannot be empty');
          return;
        }

        updatedComments = [
          ...comments,
          {
            id: newId,
            content: postText,
            createdAt: 'Today',
            score: 0,
            replies: [],
            user: currentUser,
          },
        ];

        setPostText('');
        break;

      case 'reply':
        updatedComments = comments.map((comment) => {
          if (comment.id === parentId) {
            const newReply = {
              id: newId,
              content: replyText,
              createdAt: 'Today',
              replyingTo: replyTo,
              score: 0,
              user: currentUser,
            };

            return {
              ...comment,
              replies: comment.replies ? [...comment.replies, newReply] : [newReply],
            };
          }

          return comment;
        });

        break;
      case 'edit':
        updatedComments = comments.map((comment) => {
          if (comment.id === parentId) {
            if (parentId === id) {
              return {
                ...comment,
                content: editedText,
              };
            }

            comment.replies = comment.replies.map((reply) => {
              if (reply.id === id) {
                return {
                  ...reply,
                  content: editedText,
                };
              }
              return reply;
            });
          }
          return comment;
        });

        break;

      default:
        break;
    }

    setComments(updatedComments);
    setCommentIds([...commentIds, newId]);
    executeHttpMethod(updatedComments);
  };

  const handleModalData = (id) => {
    setCommentIdToRemove(id);
    setShowModal(true);
  };

  const handleModalAction = (id, action) => {
    const parentId = findParentId(comments, id);
    let updatedComments;

    if (action === 'cancel') {
      updatedComments = [...comments];
    } else if (action === 'delete') {
      updatedComments = comments
        .map((comment) => {
          if (comment.id === parentId) {
            if (parentId === id) {
              return null;
            }

            comment.replies = comment.replies.filter((reply) => reply.id !== id);
          }
          return comment;
        })
        .filter(Boolean);
    }

    setComments(updatedComments);
    executeHttpMethod(updatedComments);
    setShowModal(false);
  };

  const executeHttpMethod = (data) => {
    fetch(API + '/comments.json', {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  };

  if (isLoading) {
    return (
      <section className="comments-container my-16">
        <div className="container">
          <p className="rounded-lg flex items-start mt-5 p-6 bg-white">Loading...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="comments-container my-16">
        <div className="container">
          <p className="rounded-lg flex items-start mt-5 p-6 bg-white">{error}</p>
        </div>
      </section>
    );
  }

  return (
    <>
      {showModal && (
        <Modal
          id={commentIdToRemove}
          title="Delete comment"
          content="Are you sure you want to delete this comment? This will remove the comment and can’t be undone."
          actionText="Delete"
          modalAction={handleModalAction}
        />
      )}
      <section className="comments-container py-16">
        <div className="container">
          <div className="comments">
            {comments.map((comment) => (
              <Comment key={comment.id} currentUser={currentUser} data={comment} controlData={handleControlData} modalData={handleModalData} />
            ))}
          </div>
          {!isMobile && (
            <div className={`post-item rounded-lg flex items-start mt-5 p-6 bg-white ${Classes['post-item']}`}>
              <img className="mr-4 h-10" src={currentUser.image.png} alt="User" width="40" height="40" />
              <textarea className="flex-1 rounded-lg mr-4 py-3 px-6 min-h-[95px]" value={postText} placeholder="Post a comment..." onChange={handlePostText}></textarea>
              <button
                className={`button button-action rounded-lg py-3.5 px-6 text-base text-medium leading-none text-white uppercase transition-all ${Classes['comment-controls-button']}`}
                onClick={() => handleControlData(null, 'post', null, null, postText)}
              >
                Send
              </button>
            </div>
          )}
          {isMobile && (
            <div className={`post-item rounded-lg mt-5 p-6 bg-white ${Classes['post-item']}`}>
              <textarea className="flex-1 rounded-lg py-3 px-6 w-full min-h-[95px]" value={postText} placeholder="Post a comment..." onChange={handlePostText}></textarea>
              <div className="flex justify-between items-center mt-4">
                <img className="mr-4 h-10" src={currentUser.image.png} alt="User" width="40" height="40" />
                <button
                  className={`button button-action rounded-lg py-3.5 px-6 text-base text-medium leading-none text-white uppercase transition-all ${Classes['comment-controls-button']}`}
                  onClick={() => handleControlData(null, 'post', null, null, postText)}
                >
                  Send
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default CommentsGroup;