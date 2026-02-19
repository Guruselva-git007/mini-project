import { useEffect, useState } from "react";
import { createComment, fetchComments } from "../../api/issues.api";

const CommentPanel = ({ issueId }) => {
  const [comments, setComments] = useState([]);
  const [message, setMessage] = useState("");

  const loadComments = async () => {
    const response = await fetchComments(issueId);
    setComments(response.comments);
  };

  useEffect(() => {
    if (!issueId) return;
    loadComments();
  }, [issueId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!message.trim()) return;

    await createComment(issueId, { message });
    setMessage("");
    await loadComments();
  };

  return (
    <section className="card">
      <h3>Comments</h3>

      <div className="comment-list">
        {comments.map((comment) => (
          <article key={comment.id} className="comment-item">
            <p>{comment.message}</p>
            <p className="muted small">
              {comment.fullName} · {new Date(comment.createdAt).toLocaleString()}
            </p>
          </article>
        ))}
      </div>

      <form className="comment-form" onSubmit={handleSubmit}>
        <input
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Add a comment"
        />
        <button className="btn" type="submit">
          Post
        </button>
      </form>
    </section>
  );
};

export default CommentPanel;
