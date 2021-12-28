const CommentList = ({ comments }) => {
  const renderedComments = comments.map((comment) => {
    let content = '';
    if(comment.status === 'pending') {
      content = 'This comment is under moderation'
    }
    if(comment.status === 'approved') {
      content = comment.content;
    }
    if(comment.status === 'rejected') {
      content = 'This comment is rejected'
    }
    return <li key={comment.id}>{content}</li>;
  });

  return comments.length >0 ? <ul>{renderedComments}</ul> : <span>No comments under this post</span>;
};

export default CommentList;
