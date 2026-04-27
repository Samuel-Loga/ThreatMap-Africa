import { useState, useEffect } from 'react'
import { communityApi } from '../api/client'
import { useAuth } from '../context/AuthContext'

function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date)) / 1000)
  if (s < 60) return `${s}s ago`
  if (s < 3600) return `${Math.floor(s/60)}m ago`
  if (s < 86400) return `${Math.floor(s/3600)}h ago`
  return `${Math.floor(s/86400)}d ago`
}

function VoteButtons({ upvotes, downvotes, onVote }) {
  return (
    <div className="flex items-center gap-1">
      <button onClick={() => onVote('up')} className="text-xs px-1.5 py-0.5 rounded bg-dark-700 hover:bg-green-900/40 text-gray-400 hover:text-green-300 transition-colors">▲ {upvotes}</button>
      <button onClick={() => onVote('down')} className="text-xs px-1.5 py-0.5 rounded bg-dark-700 hover:bg-red-900/40 text-gray-400 hover:text-red-300 transition-colors">▼ {downvotes}</button>
    </div>
  )
}

function CommentThread({ comments, postId, onRefresh, depth = 0 }) {
  const { user } = useAuth()
  const [replyTo, setReplyTo] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function submitReply(parentId) {
    if (!replyText.trim()) return
    setSubmitting(true)
    try {
      await communityApi.createComment({ content: replyText, post_id: postId, parent_id: parentId })
      setReplyText('')
      setReplyTo(null)
      onRefresh()
    } finally { setSubmitting(false) }
  }

  async function handleVote(commentId, type) {
    try { await communityApi.castVote({ comment_id: commentId, vote_type: type }) } catch {}
    onRefresh()
  }

  return (
    <div className={depth > 0 ? 'ml-6 border-l border-dark-600 pl-4' : ''}>
      {comments.map(c => (
        <div key={c.id} className="py-3 border-b border-dark-700 last:border-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm text-gray-200 flex-1">{c.content}</p>
            <VoteButtons upvotes={c.upvotes} downvotes={c.downvotes} onVote={(t) => handleVote(c.id, t)} />
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-[10px] text-gray-500">{timeAgo(c.created_at)}</span>
            {depth < 2 && <button onClick={() => setReplyTo(replyTo === c.id ? null : c.id)} className="text-[10px] text-primary hover:underline">Reply</button>}
            {user?.id === c.author_id && <button onClick={async () => { await communityApi.deleteComment(c.id); onRefresh() }} className="text-[10px] text-red-400 hover:underline">Delete</button>}
          </div>
          {replyTo === c.id && (
            <div className="mt-2 flex gap-2">
              <input value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Write a reply…" className="flex-1 bg-dark-700 border border-dark-600 rounded px-2 py-1 text-sm text-gray-200 focus:outline-none focus:border-primary" />
              <button onClick={() => submitReply(c.id)} disabled={submitting} className="text-xs px-3 py-1 bg-primary rounded text-white disabled:opacity-50">Post</button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function PostDetail({ post, onBack }) {
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [votes, setVotes] = useState({ upvotes: post.upvotes, downvotes: post.downvotes })

  useEffect(() => { loadComments() }, [post.id])

  async function loadComments() {
    const res = await communityApi.listComments({ post_id: post.id })
    setComments(res.data)
  }

  async function submitComment() {
    if (!newComment.trim()) return
    setSubmitting(true)
    try {
      await communityApi.createComment({ content: newComment, post_id: post.id })
      setNewComment('')
      loadComments()
    } finally { setSubmitting(false) }
  }

  async function handlePostVote(type) {
    try { await communityApi.castVote({ post_id: post.id, vote_type: type }) } catch {}
    const res = await communityApi.getPost(post.id)
    setVotes({ upvotes: res.data.upvotes, downvotes: res.data.downvotes })
  }

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="text-sm text-gray-400 hover:text-white">← Back to forum</button>
      <div className="bg-dark-800 border border-dark-600 rounded-xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            {post.is_pinned && <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded mr-2">📌 Pinned</span>}
            <h2 className="text-xl font-bold text-white">{post.title}</h2>
            <p className="text-[10px] text-gray-500 mt-1">{timeAgo(post.created_at)}</p>
          </div>
          <VoteButtons upvotes={votes.upvotes} downvotes={votes.downvotes} onVote={handlePostVote} />
        </div>
        <p className="mt-4 text-gray-300 text-sm whitespace-pre-wrap">{post.content}</p>
      </div>

      <div className="bg-dark-800 border border-dark-600 rounded-xl p-6 space-y-4">
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Discussion ({comments.length})</h3>
        <CommentThread comments={comments} postId={post.id} onRefresh={loadComments} />
        <div className="flex gap-2 pt-2 border-t border-dark-700">
          <textarea value={newComment} onChange={e => setNewComment(e.target.value)} rows={2} placeholder="Add to the discussion…" className="flex-1 bg-dark-700 border border-dark-600 rounded px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-primary resize-none" />
          <button onClick={submitComment} disabled={submitting || !newComment.trim()} className="px-4 py-2 bg-primary rounded text-white text-sm font-semibold disabled:opacity-50 self-end">Post</button>
        </div>
      </div>
    </div>
  )
}

export default function Forum() {
  const { user } = useAuth()
  const [forums, setForums] = useState([])
  const [selectedForum, setSelectedForum] = useState(null)
  const [posts, setPosts] = useState([])
  const [selectedPost, setSelectedPost] = useState(null)
  const [showNewForum, setShowNewForum] = useState(false)
  const [showNewPost, setShowNewPost] = useState(false)
  const [newForum, setNewForum] = useState({ title: '', description: '' })
  const [newPost, setNewPost] = useState({ title: '', content: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => { loadForums() }, [])
  useEffect(() => { if (selectedForum) loadPosts(selectedForum.id) }, [selectedForum])

  async function loadForums() {
    setLoading(true)
    try { const res = await communityApi.listForums(); setForums(res.data) } finally { setLoading(false) }
  }

  async function loadPosts(forumId) {
    const res = await communityApi.listPosts(forumId)
    setPosts(res.data)
  }

  async function createForum() {
    await communityApi.createForum(newForum)
    setNewForum({ title: '', description: '' })
    setShowNewForum(false)
    loadForums()
  }

  async function createPost() {
    await communityApi.createPost({ ...newPost, forum_id: selectedForum.id })
    setNewPost({ title: '', content: '' })
    setShowNewPost(false)
    loadPosts(selectedForum.id)
  }

  const canCreateForum = ['Analyst', 'OrgAdmin', 'SuperAdmin'].includes(user?.role)
  const inputClass = "w-full bg-dark-700 border border-dark-600 rounded px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-primary"

  if (selectedPost) return (
    <div className="max-w-3xl mx-auto">
      <PostDetail post={selectedPost} onBack={() => setSelectedPost(null)} />
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Community Forum</h1>
          <p className="text-gray-400 text-sm mt-1">Discuss indicators, share case studies, collaborate on campaigns</p>
        </div>
        {canCreateForum && !selectedForum && (
          <button onClick={() => setShowNewForum(true)} className="px-4 py-2 bg-primary rounded text-white text-sm font-semibold hover:bg-primary/90">+ New Forum</button>
        )}
        {selectedForum && (
          <button onClick={() => setShowNewPost(true)} className="px-4 py-2 bg-primary rounded text-white text-sm font-semibold hover:bg-primary/90">+ New Post</button>
        )}
      </div>

      {showNewForum && (
        <div className="bg-dark-800 border border-primary/50 rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-semibold text-gray-300">Create Forum</h3>
          <input value={newForum.title} onChange={e => setNewForum({...newForum, title: e.target.value})} placeholder="Forum title" className={inputClass} />
          <textarea value={newForum.description} onChange={e => setNewForum({...newForum, description: e.target.value})} placeholder="Description (optional)" rows={2} className={`${inputClass} resize-none`} />
          <div className="flex gap-2">
            <button onClick={() => setShowNewForum(false)} className="flex-1 py-1.5 text-sm border border-dark-600 rounded text-gray-400 hover:bg-dark-700">Cancel</button>
            <button onClick={createForum} disabled={!newForum.title} className="flex-1 py-1.5 text-sm bg-primary rounded text-white disabled:opacity-50">Create</button>
          </div>
        </div>
      )}

      {showNewPost && (
        <div className="bg-dark-800 border border-primary/50 rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-semibold text-gray-300">New Post in "{selectedForum.title}"</h3>
          <input value={newPost.title} onChange={e => setNewPost({...newPost, title: e.target.value})} placeholder="Post title" className={inputClass} />
          <textarea value={newPost.content} onChange={e => setNewPost({...newPost, content: e.target.value})} placeholder="Write your post…" rows={5} className={`${inputClass} resize-none`} />
          <div className="flex gap-2">
            <button onClick={() => setShowNewPost(false)} className="flex-1 py-1.5 text-sm border border-dark-600 rounded text-gray-400 hover:bg-dark-700">Cancel</button>
            <button onClick={createPost} disabled={!newPost.title || !newPost.content} className="flex-1 py-1.5 text-sm bg-primary rounded text-white disabled:opacity-50">Post</button>
          </div>
        </div>
      )}

      {!selectedForum ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading && <p className="text-gray-400 animate-pulse col-span-2">Loading forums…</p>}
          {!loading && forums.length === 0 && (
            <div className="col-span-2 text-center py-16 text-gray-500">
              <p className="text-4xl mb-3">💬</p>
              <p>No forums yet. {canCreateForum ? 'Create the first one!' : 'Check back later.'}</p>
            </div>
          )}
          {forums.map(f => (
            <button key={f.id} onClick={() => setSelectedForum(f)} className="text-left bg-dark-800 border border-dark-600 rounded-xl p-5 hover:border-primary/50 transition-colors">
              <h3 className="font-semibold text-white">{f.title}</h3>
              {f.description && <p className="text-sm text-gray-400 mt-1 line-clamp-2">{f.description}</p>}
              <p className="text-[10px] text-gray-500 mt-3">{timeAgo(f.created_at)}</p>
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          <button onClick={() => { setSelectedForum(null); setPosts([]) }} className="text-sm text-gray-400 hover:text-white">← All Forums</button>
          <h2 className="text-lg font-bold">{selectedForum.title}</h2>
          {posts.length === 0 && <p className="text-gray-500 text-sm italic py-8 text-center">No posts yet. Start the conversation!</p>}
          {posts.map(p => (
            <button key={p.id} onClick={() => setSelectedPost(p)} className="w-full text-left bg-dark-800 border border-dark-600 rounded-lg px-5 py-4 hover:border-primary/50 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  {p.is_pinned && <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded mr-2">📌</span>}
                  <span className="text-sm font-semibold text-white">{p.title}</span>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-1">{p.content}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 text-[10px] text-gray-500">
                  <span>▲ {p.upvotes}</span>
                  <span>{timeAgo(p.created_at)}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
