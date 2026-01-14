import { useState } from 'react';

export default function CommentEditor({ initial='', onSave, onCancel }) {
  const [text, setText] = useState(initial);
  return (
    <div style={{marginTop:8}}>
      <textarea
        value={text}
        onChange={(e)=>setText(e.target.value)}
        rows={3}
        style={{width:'100%'}}
      />
      <div style={{marginTop:6}}>
        <button onClick={()=>onSave?.(text)} disabled={!text.trim()}>Save</button>
        <button onClick={onCancel} style={{marginLeft:8}}>Cancel</button>
      </div>
    </div>
  );
}