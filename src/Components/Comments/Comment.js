import { useState, useEffect } from 'react';

import ImagePlus from '../../images/icon-plus.svg';
import ImageMinus from '../../images/icon-minus.svg';
import ImageReply from '../../images/icon-reply.svg';
import ImageDelete from '../../images/icon-delete.svg';
import ImageEdit from '../../images/icon-edit.svg';
import Classes from './Comments.module.css';

function Comment({ id, currentUser, score: initialScore, avatar, username, date, replyTo, content, controlData, modalData }) {
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [score, setScore] = useState(initialScore);
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [showEdit, setShowEdit] = useState(false);
  const [editedText, setEditedText] = useState(content);
  const [commentText, setCommentText] = useState(content);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (username === currentUser.username) {
      setIsCurrentUser(true);
    }
  }, [username, currentUser.username]);

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

  const handleComment = () => {
    setShowReply(!showReply);
  };

  const handleEdit = () => {
    setShowEdit(!showEdit);
  };

  const handleEditedText = (e) => {
    setEditedText(e.target.value);
  };

  const handleReplyText = (e) => {
    setReplyText(e.target.value);
  };

  const handleModal = () => {
    modalData(id);
  };

  const handleControls = (action, replyTo, scoreAmount) => {
    let newScore;

    if (action === 'score') {
      setScore((prevScore) => prevScore + scoreAmount);
      newScore = score + scoreAmount;
    }

    if (action === 'reply') {
      if (replyText === '') {
        alert('Text cannot be empty');
        return;
      } else {
        setShowReply(false);
        setReplyText('');
      }
    }

    if (action === 'edit') {
      if (editedText === '') {
        alert('Text cannot be empty');
        return;
      } else {
        setShowEdit(false);
        setCommentText(editedText);
      }
    }

    controlData(id, action, newScore, replyTo, replyText, editedText);
  };

  return (
    <>
      <div className="comment-item rounded-lg mt-5 p-6 bg-white">
        <div className="flex">
          {!isMobile && (
            <div className={`comment-score flex flex-col rounded-[10px] mr-6 min-w-[40px] ${Classes['comment-score']}`}>
              <button className="pt-3 pb-5" onClick={() => handleControls('score', null, +1)} disabled={isCurrentUser}>
                <img className="mx-auto" src={ImagePlus} alt="Press to up-vote the comment." width="10" height="10" />
              </button>
              <span className="text-base font-medium text-center leading-none">{score}</span>
              <button className="pt-5 pb-3" onClick={() => handleControls('score', null, -1)} disabled={isCurrentUser}>
                <img className="mx-auto" src={ImageMinus} alt="Press to down-vote the comment." width="10" height="3" />
              </button>
            </div>
          )}
          <div className="flex-1">
            <div className="comment-head flex justify-between items-center">
              <div className={`comment-profile flex flex-wrap items-center mr-6 gap-2 ${Classes['comment-profile']}`}>
                <img className="mr-2 object-cover" src={avatar} alt={username} width="32" height="32" />
                <h6 className="text-base font-medium leading-none">{username}</h6>
                {isCurrentUser && <span className="rounded-sm mr-2 p-1.5 text-[13px] font-medium text-white leading-none">you</span>}
                <p className="text-base leading-none">{date}</p>
              </div>
              {!isMobile && (
                <div className="comment-controls flex">
                  {isCurrentUser && (
                    <>
                      <button className={`flex text-base font-medium leading-none transition-all cursor-pointer ${Classes['comment-controls-danger']}`} onClick={handleModal}>
                        <img className="inline mr-2" src={ImageDelete} alt="Press to delete the comment." width="12" height="14" />
                        Delete
                      </button>
                      <button className={`flex ml-6 text-base font-medium leading-none transition-all cursor-pointer ${Classes['comment-controls-normal']}`} onClick={handleEdit}>
                        <img className="inline mr-2" src={ImageEdit} alt="Press to edit the comment." width="14" height="14" />
                        Edit
                      </button>
                    </>
                  )}
                  {!isCurrentUser && (
                    <button className={`flex text-base font-medium leading-none transition-all cursor-pointer ${Classes['comment-controls-normal']}`} onClick={handleComment}>
                      <img className="inline mr-2" src={ImageReply} alt="Press to respond or provide a reply." width="14" height="13" />
                      Reply
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className={`comment-body mt-[15px] ${Classes['comment-body']}`}>
              {!showEdit && (
                <p className="text-base leading-6">
                  {replyTo && <span className="font-medium">@{replyTo}</span>} {commentText}
                </p>
              )}
              {showEdit && (
                <textarea className="flex-1 rounded-lg py-3 px-6 w-full min-h-[95px]" value={editedText} onChange={handleEditedText}>
                  {commentText}
                </textarea>
              )}
            </div>
          </div>
        </div>
        {isMobile && (
          <div className="flex flex-wrap justify-between items-center mt-4 gap-2">
            <div className={`comment-score flex items-center rounded-[10px] min-w-[40px] ${Classes['comment-score']}`}>
              <button className="p-3.5 pr-5" onClick={() => handleControls('score', null, +1)} disabled={isCurrentUser}>
                <img className="mx-auto" src={ImagePlus} alt="Press to up-vote the comment." width="10" height="10" />
              </button>
              <span className="text-base font-medium text-center leading-none">{score}</span>
              <button className="p-3.5 pl-5" onClick={() => handleControls('score', null, -1)} disabled={isCurrentUser}>
                <img className="mx-auto" src={ImageMinus} alt="Press to down-vote the comment." width="10" height="3" />
              </button>
            </div>
            <div className="comment-controls">
              {isCurrentUser && (
                <>
                  <button className={`text-base font-medium leading-none transition-all cursor-pointer ${Classes['comment-controls-danger']}`} onClick={handleModal}>
                    <img className="inline mr-2" src={ImageDelete} alt="Press to delete the comment." width="12" height="14" />
                    Delete
                  </button>
                  <button className={`ml-6 text-base font-medium leading-none transition-all cursor-pointer ${Classes['comment-controls-normal']}`} onClick={handleEdit}>
                    <img className="inline mr-2" src={ImageEdit} alt="Press to edit the comment." width="14" height="14" />
                    Edit
                  </button>
                </>
              )}
              {!isCurrentUser && (
                <button className={`text-base font-medium leading-none transition-all cursor-pointer ${Classes['comment-controls-normal']}`} onClick={handleComment}>
                  <img className="inline mr-2" src={ImageReply} alt="Press to respond or provide a reply." width="14" height="13" />
                  Reply
                </button>
              )}
            </div>
          </div>
        )}
        {showEdit && (
          <div className="comment-controls flex justify-end mt-4">
            <button
              className={`button button-action rounded-lg py-3.5 px-6 text-base text-medium leading-none text-white uppercase transition-all ${Classes['comment-controls-button']}`}
              onClick={() => handleControls('edit', null, null)}
            >
              Update
            </button>
          </div>
        )}
      </div>
      {showReply && !isMobile && (
        <div className={`reply-item rounded-lg flex items-start mt-2 p-6 bg-white ${Classes['reply-item']}`}>
          <img className="mr-4 h-10" src={currentUser.image.png} alt="User Icon" width="40" height="40" />
          <textarea className="flex-1 rounded-lg mr-4 py-3 px-6 min-h-[95px]" value={replyText} placeholder="Reply to comment..." onChange={handleReplyText}></textarea>
          <button
            className={`button button-action rounded-lg py-3.5 px-6 text-base text-medium leading-none text-white uppercase transition-all ${Classes['comment-controls-button']}`}
            onClick={() => handleControls('reply', username)}
          >
            Reply
          </button>
        </div>
      )}
      {showReply && isMobile && (
        <div className={`reply-item rounded-lg mt-2 p-6 bg-white ${Classes['reply-item']}`}>
          <textarea className="flex-1 rounded-lg py-3 px-6 w-full min-h-[95px]" value={replyText} placeholder="Reply to comment..." onChange={handleReplyText}></textarea>
          <div className="flex justify-between items-center mt-4">
            <img className="mr-4 h-10" src={currentUser.image.png} alt="User icon" width="40" height="40" />
            <button
              className={`button button-action rounded-lg py-3.5 px-6 text-base text-medium leading-none text-white uppercase transition-all ${Classes['comment-controls-button']}`}
              onClick={() => handleControls('reply', username)}
            >
              Reply
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default Comment;
