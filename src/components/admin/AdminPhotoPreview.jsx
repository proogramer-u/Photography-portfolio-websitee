export default function AdminPhotoPreview({ photo, gallery, busy, onCover }) {
  const isCover = gallery.coverPath === photo.storagePath
  return (
    <div className="admin-photo-editor">
      <div className="admin-photo-preview"><img src={photo.url} alt={photo.caption || 'Selected photograph'} /></div>
      <div className="admin-photo-fields">
        {photo.caption && <p className="admin-existing-caption">{photo.caption}</p>}
        <p id="photo-editor-dependency" className="admin-dependency-note">Photo name and description editing will be available after the photo metadata fields are connected. Your existing caption is preserved.</p>
        <label>Photo name<input type="text" disabled aria-describedby="photo-editor-dependency" placeholder="Not connected yet" /></label>
        <label>Description<textarea rows="4" disabled aria-describedby="photo-editor-dependency" placeholder="Not connected yet" /></label>
        <button className="admin-button-primary" disabled aria-describedby="photo-editor-dependency">Save Changes</button>
        <button className="admin-button-secondary" onClick={onCover} disabled={busy || isCover}>{isCover ? 'Current Gallery Cover' : 'Set as Gallery Cover'}</button>
        <div className="admin-photo-delete"><button className="admin-button-danger" disabled aria-describedby="photo-delete-dependency">Delete Photo</button><p id="photo-delete-dependency">Individual deletion needs database and file cleanup integration.</p></div>
      </div>
    </div>
  )
}
