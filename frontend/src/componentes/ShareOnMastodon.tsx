import { useState } from 'react';

const getText = () =>
  `Bahn Bingo - Das hoch moderne, inovative feedback portal der Deutschen Bahn AG.
https://bahn.bingo`;

const openMastodon = ({ instance, text }: { instance: string; text: string; }) => {
  const shareUrl = `${instance}share?text=${encodeURIComponent(text)}`;
  window.open(shareUrl, '_blank');
}

function ShareOnMastodon() {
  const [instance, setInstance] = useState("");

  return (
    <>
      <button
        className="btn btn-info"
        onClick={() => (document.getElementById('mastodon-modal') as HTMLDialogElement).showModal()}
      >
        Share on Mastodon
      </button>
      <dialog id="mastodon-modal" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
          </form>
          <h3 className="font-bold text-lg">Please enter your instance</h3>
          <p className="py-4">As Mastodon has many servers, we need to know where to send the request.</p>
          <div className="form-control w-full max-w-xs">
            <label className="label">
              <span className="label-text">Your Mastodon Server</span>
            </label>
            <input
              type="text"
              placeholder="https://chaos.social"
              className="input input-bordered w-full max-w-xs"
              onChange={(event) => setInstance(event.target.value)}
            />
          </div>
          <div className="modal-action"></div>
          <button
            className="btn btn-info"
            onClick={() => openMastodon({ instance, text: getText() })}
          >
            Share
          </button>
        </div>
      </dialog >
    </>
  )
}

export default ShareOnMastodon
