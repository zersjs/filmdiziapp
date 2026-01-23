import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaTimes, FaPaperPlane, FaTrash, FaUser } from 'react-icons/fa';
import { commentsService } from '../../services/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { triggerHaptic, HapticType } from '../../utils/haptic';

const CommentsModal = ({ isOpen, onClose, mediaId, mediaType, title }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const [isClosing, setIsClosing] = useState(false);
  
  // Native swipe-to-close state
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  
  const inputRef = useRef(null);
  const modalRef = useRef(null);
  const dragStartRef = useRef({ y: 0, time: 0 });
  const touchMoveRef = useRef(0);

  // Yorumları yükle
  useEffect(() => {
    if (isOpen && mediaId) {
      loadComments();
      setIsClosing(false);
      setDragY(0);
    }
  }, [isOpen, mediaId, mediaType]);

  // Modal açıldığında input'a focus
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 400);
    }
  }, [isOpen]);

  // Arka plan scroll'u engelle + touch move engelle
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.top = `-${window.scrollY}px`;
    } else {
      const scrollY = document.body.style.top;
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
      window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
    };
  }, [isOpen]);

  const loadComments = async () => {
    setLoading(true);
    try {
      const { data, count } = await commentsService.getComments(mediaId, mediaType);
      setComments(data);
      setCommentCount(count);
    } catch (e) {
      console.error('Yorumlar yüklenemedi:', e);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !user || sending) return;

    triggerHaptic(HapticType.MEDIUM);
    setSending(true);
    try {
      const userInfo = {
        name: user.user_metadata?.full_name || user.user_metadata?.username || user.email?.split('@')[0],
        avatar: user.user_metadata?.avatar_url || user.user_metadata?.picture
      };

      const { data, error } = await commentsService.addComment(
        user.id,
        mediaId,
        mediaType,
        newComment.trim(),
        userInfo
      );

      if (!error && data) {
        setComments(prev => [data, ...prev]);
        setCommentCount(prev => prev + 1);
        setNewComment('');
        triggerHaptic(HapticType.SUCCESS);
      }
    } catch (e) {
      console.error('Yorum gönderilemedi:', e);
      triggerHaptic(HapticType.ERROR);
    }
    setSending(false);
  };

  const handleDelete = async (commentId) => {
    if (!user) return;
    
    triggerHaptic(HapticType.WARNING);
    try {
      const { error } = await commentsService.deleteComment(user.id, commentId);
      if (!error) {
        setComments(prev => prev.filter(c => c.id !== commentId));
        setCommentCount(prev => prev - 1);
        triggerHaptic(HapticType.SUCCESS);
      }
    } catch (e) {
      console.error('Yorum silinemedi:', e);
      triggerHaptic(HapticType.ERROR);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return 'Az önce';
    if (diff < 3600) return `${Math.floor(diff / 60)} dk önce`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} sa önce`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} gün önce`;
    return date.toLocaleDateString('tr-TR');
  };

  // Smooth close with animation
  const handleClose = useCallback(() => {
    setIsClosing(true);
    setDragY(0);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300);
  }, [onClose]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Native swipe-to-close handlers
  const handleTouchStart = useCallback((e) => {
    // Sadece handle bar veya header üzerinde başlatılan touch'ları kabul et
    const target = e.target;
    const isHandleArea = target.closest('.comments-modal-handle') || 
                         target.closest('.comments-modal-header');
    
    if (!isHandleArea) return;
    
    dragStartRef.current = {
      y: e.touches[0].clientY,
      time: Date.now()
    };
    setIsDragging(true);
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!isDragging) return;
    
    const currentY = e.touches[0].clientY;
    const diff = currentY - dragStartRef.current.y;
    
    // Sadece aşağı çekmeye izin ver
    if (diff > 0) {
      // Rubber band effect - çekildikçe direnç artar
      const dampedDiff = Math.pow(diff, 0.85);
      touchMoveRef.current = dampedDiff;
      setDragY(dampedDiff);
      
      // Prevent default to stop background scrolling
      e.preventDefault();
    }
  }, [isDragging]);

  const handleTouchEnd = useCallback((e) => {
    if (!isDragging) return;
    
    const timeDiff = Date.now() - dragStartRef.current.time;
    const velocity = touchMoveRef.current / timeDiff;
    
    // Hızlı swipe (velocity > 0.5) veya yarısından fazla çekilmiş
    const shouldClose = velocity > 0.5 || dragY > 150;
    
    if (shouldClose) {
      handleClose();
    } else {
      // Snap back animation
      setDragY(0);
    }
    
    setIsDragging(false);
    touchMoveRef.current = 0;
  }, [isDragging, dragY, handleClose]);

  // ESC tuşu ile kapatma
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  if (!isOpen && !isClosing) return null;

  const modalTransform = isDragging 
    ? `translateY(${dragY}px)` 
    : isClosing 
      ? 'translateY(100%)' 
      : 'translateY(0)';

  const overlayOpacity = isDragging 
    ? Math.max(0.1, 0.5 - (dragY / 600)) 
    : isClosing 
      ? 0 
      : 0.5;

  return (
    <div 
      className={`comments-modal-overlay ${isClosing ? 'closing' : ''}`}
      onClick={handleBackdropClick}
      style={{ 
        backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})`,
        transition: isDragging ? 'none' : 'background-color 0.3s ease'
      }}
    >
      <div 
        ref={modalRef}
        className={`comments-modal ${isOpen && !isClosing ? 'open' : ''}`}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: modalTransform,
          transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)'
        }}
      >
        {/* Handle bar - swipe indicator */}
        <div className="comments-modal-handle">
          <div className="comments-handle-bar" />
        </div>

        {/* Header */}
        <div className="comments-modal-header">
          <h3>Yorumlar <span>({commentCount})</span></h3>
          <button className="comments-close-btn" onClick={handleClose}>
            <FaTimes />
          </button>
        </div>

        {/* Comments List */}
        <div className="comments-list">
          {loading ? (
            <div className="comments-loading">
              <div className="comments-loading-spinner" />
              <p>Yorumlar yükleniyor...</p>
            </div>
          ) : comments.length === 0 ? (
            <div className="comments-empty">
              <p>Henüz yorum yapılmamış</p>
              <span>İlk yorumu sen yap!</span>
            </div>
          ) : (
            comments.map(comment => (
              <div key={comment.id} className="comment-item">
                <div className="comment-avatar">
                  {comment.user_avatar ? (
                    <img src={comment.user_avatar} alt={comment.user_name} />
                  ) : (
                    <FaUser />
                  )}
                </div>
                <div className="comment-content">
                  <div className="comment-header">
                    <span className="comment-author">{comment.user_name}</span>
                    <span className="comment-date">{formatDate(comment.created_at)}</span>
                  </div>
                  <p className="comment-text">{comment.content}</p>
                </div>
                {user?.id === comment.user_id && (
                  <button 
                    className="comment-delete"
                    onClick={() => handleDelete(comment.id)}
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* Input Area */}
        <div className="comments-input-area">
          {user ? (
            <form onSubmit={handleSubmit} className="comments-form">
              <div className="comments-input-avatar">
                {user.user_metadata?.avatar_url || user.user_metadata?.picture ? (
                  <img src={user.user_metadata?.avatar_url || user.user_metadata?.picture} alt="You" />
                ) : (
                  <FaUser />
                )}
              </div>
              <input
                ref={inputRef}
                type="text"
                placeholder="Yorum yaz..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => e.stopPropagation()}
                disabled={sending}
              />
              <button 
                type="submit" 
                disabled={!newComment.trim() || sending}
                className={sending ? 'sending' : ''}
              >
                <FaPaperPlane />
              </button>
            </form>
          ) : (
            <div className="comments-login-prompt">
              <p>Yorum yapmak için <a href="/login">giriş yapın</a></p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentsModal;
