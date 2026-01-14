import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  getPost, updatePost, deletePost, togglePostLock,
  listComments, addComment, updateComment, deleteComment
} from '../lib/forumApi';
import { useAuthStore } from '../stores/auth';
import {
  canEditPost, canDeletePost, canLockPost,
  canEditComment, canDeleteComment
} from '../components/Forum/ForumAuth';
import CommentEditor from '../components/Forum/CommentEditor';

export default function ForumPost() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user, hasAnyRole } = useAuthStore();

  const [post, setPost] = useState(null);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody]   = useState('');

  const [page, setPage] = useState(0);
  const [comments, setComments] = useState({ items:[], page:0, size:20, total:0 });
  const [newText, setNewText] = useState('');
  const [err, setErr] = useState('');

  async function loadPost(){
    const p = await getPost(id);
    setPost(p);
    setTitle(p.title);
    setBody(p.body);
  }
  async function loadComments(p=page){
    setComments(await listComments(id, { page: p, size:20 }));
  }

  useEffect(() => { loadPost(); loadComments(0); setPage(0); }, [id]);

  // ---- Post actions
  async function savePost(){
    try {
      const updated = await updatePost(id, { title, body });
      setPost(updated);
      setEditing(false);
    } catch (e) {
      setErr(e?.response?.data || 'Failed to update post');
    }
  }
  async function removePost(){
    if (!confirm('Delete this post?')) return;
    try { await deletePost(id); nav('/forum'); }
    catch (e) { alert('Failed to delete post'); }
  }
  async function toggleLock(){
    try {
      const updated = await togglePostLock(id, !post.locked);
      setPost(updated);
    } catch (e) {
      alert('Failed to change lock');
    }
  }

  // Comment actions
  async function addNewComment(e){
    e.preventDefault();
    if (!newText.trim()) return;
    await addComment({ postId: Number(id), body: newText });
    setNewText('');
    await loadComments(0);
    setPage(0);
  }

  async function onSaveComment(c, text){
    await updateComment(c.id, { body: text });
    await loadComments(page);
  }
  async function onDeleteComment(c){
    if (!confirm('Delete this comment?')) return;
    await deleteComment(c.id);
    await loadComments(page);
  }

  if (!post) return <div className="universalpagecontainer">Loading…</div>;

  const editable   = canEditPost(post, user, hasAnyRole);
  const deletable  = canDeletePost(post, user, hasAnyRole);
  const lockable   = canLockPost(post, user, hasAnyRole);

  return (
    <div className="universalpagecontainer">
      {editing ? (
        <>
          <input value={title} onChange={e=>setTitle(e.target.value)} style={{display:'block', width:'100%', marginBottom:8}} />
          <textarea value={body} onChange={e=>setBody(e.target.value)} rows={8} style={{display:'block', width:'100%'}} />
          {err && <div style={{color:'crimson'}}>{err}</div>}
          <div style={{marginTop:8}}>
            <button onClick={savePost}>Save</button>
            <button onClick={()=>{setEditing(false); setTitle(post.title); setBody(post.body);}} style={{marginLeft:8}}>Cancel</button>
          </div>
        </>
      ) : (
        <>
          <h2 style={{marginBottom:4}}>
            {post.title} {post.locked && <span title="Locked">🔒</span>}
          </h2>
          <small style={{opacity:.7}}>
            by {post.authorUsername} • {new Date(post.createdAt).toLocaleString()}
          </small>
          <p style={{marginTop:12, whiteSpace:'pre-wrap'}}>{post.body}</p>

          <div style={{marginTop:8}}>
            {editable && !post.locked && <button onClick={()=>setEditing(true)}>Edit</button>}
            {deletable && <button onClick={removePost} style={{marginLeft:8}}>Delete</button>}
            {lockable && (
              <button onClick={toggleLock} style={{marginLeft:8}}>
                {post.locked ? 'Unlock' : 'Lock'}
              </button>
            )}
          </div>
        </>
      )}

      <h3 style={{marginTop:24}}>Comments</h3>

      <ul style={{listStyle:'none', padding:0}}>
        {comments.items.map(c => {
          const cEditable  = canEditComment(c, user, hasAnyRole) && !post.locked;
          const cDeletable = canDeleteComment(c, user, hasAnyRole);
          const [isEditing, setIsEditing] = [c.__editing || false, (v)=>{ c.__editing=v; setComments({...comments}); }];

          return (
            <li key={c.id} style={{borderTop:'1px solid #eee', padding:'8px 0'}}>
              <div style={{marginBottom:4}}>
                <b>{c.authorUsername}</b>
                <small style={{marginLeft:8, opacity:.7}}>
                  {new Date(c.createdAt).toLocaleString()}
                </small>
              </div>

              {!isEditing ? (
                <div style={{whiteSpace:'pre-wrap'}}>{c.body}</div>
              ) : (
                <CommentEditor
                  initial={c.body}
                  onSave={async (text)=>{ await onSaveComment(c, text); setIsEditing(false); }}
                  onCancel={()=>setIsEditing(false)}
                />
              )}

              <div style={{marginTop:6}}>
                {cEditable && !isEditing && <button onClick={()=>setIsEditing(true)}>Edit</button>}
                {cDeletable && <button onClick={()=>onDeleteComment(c)} style={{marginLeft:8}}>Delete</button>}
              </div>
            </li>
          );
        })}
      </ul>

      <div style={{marginTop:16}}>
        <button disabled={page===0} onClick={()=>{ const n=page-1; setPage(n); loadComments(n); }}>Prev</button>
        <span style={{margin:'0 8px'}}>Page {page+1}</span>
        <button disabled={(page+1)*comments.size >= comments.total} onClick={()=>{ const n=page+1; setPage(n); loadComments(n); }}>Next</button>
      </div>

      {!post.locked && (
        <form onSubmit={addNewComment} style={{marginTop:24}}>
          <textarea
            value={newText}
            onChange={e=>setNewText(e.target.value)}
            placeholder="Write a comment…"
            rows={3}
            style={{display:'block', width:'100%'}}
          />
          <div><button type="submit" disabled={!newText.trim()}>Post Comment</button></div>
        </form>
      )}
      {post.locked && <div style={{marginTop:12, opacity:.7}}>Comments are locked.</div>}
    </div>
  );
}