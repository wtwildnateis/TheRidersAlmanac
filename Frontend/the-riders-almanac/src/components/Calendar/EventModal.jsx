import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import "./EventModal.css";
import Button from "../Button/Button";
import StateForm from "./StateDropdownForm";
import { handleValidation, clearValidation } from "../FormValidationMessage/formValidation";
import { uploadFlyer } from "../../lib/uploads";

const AddEventModal = ({ date, onClose, onSave, initialEvent, mode = "add" }) => {
  const [formData, setFormData] = useState({
    title: "",
    type: "",
    flyer: "",
    start: date || new Date(),
    end: date || new Date(),
    street: "",
    city: "",
    state: "",
    zip: "",
    description: "",
  });
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (initialEvent) {
      setFormData({
        title: initialEvent.title || "",
        type: initialEvent.type || "",
        flyer: initialEvent.flyer || "",
        start: initialEvent.start ? new Date(initialEvent.start) : date || new Date(),
        end: initialEvent.end ? new Date(initialEvent.end) : date || new Date(),
        street: initialEvent.street || "",
        city: initialEvent.city || "",
        state: initialEvent.state || "",
        zip: initialEvent.zip || "",
        description: initialEvent.description || "",
      });
    }
  }, [initialEvent, date]);

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const [portalEl, setPortalEl] = useState(null);
  useEffect(() => {
    let el = document.getElementById("modal-root");
    if (!el) {
      el = document.createElement("div");
      el.id = "modal-root";
      document.body.appendChild(el);
    }
    setPortalEl(el);

    // lock scroll
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // close on Escape
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const modalRef = useRef(null);

  function formatDateTimeLocal(date) {
    if (!date) return "";
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return "";
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(
      d.getMinutes()
    )}`;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    const parsedValue = name === "start" || name === "end" ? new Date(value) : value;
    setFormData((prev) => ({ ...prev, [name]: parsedValue }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      title: formData.title,
      type: formData.type,
      flyer: formData.flyer || null,
      start: formData.start,
      end: formData.end,
      street: formData.street,
      city: formData.city,
      state: formData.state,
      zip: formData.zip,
      description: formData.description || "",
    });
  };

  if (!portalEl) return null;

  return createPortal(
    <div
      className="ra-modal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={modalRef}
        className="ra-modal-card"
      >
        <div className="ra-modal-header">
          <h3 className="ra-modal-title">
            {mode === "edit" ? "Edit Event Details" : "Add New Biking Event"}
          </h3>
          <button onClick={onClose} >✕</button>
        </div>

        <div className="ra-modal-body">
          <form className="modalstyle" onSubmit={handleSubmit}>
            <label>
              Event Name
              <input
                type="text"
                name="title"
                placeholder="Please enter your event name"
                value={formData.title}
                required
                onChange={(e) => {
                  setFormData({ ...formData, title: e.target.value });
                  clearValidation(e);
                }}
                onInvalid={(e) => handleValidation(e, "Please enter the event name.")}
              />
            </label>

            <label>
              Type of Event
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
              >
                <option value="">Select Type</option>
                <option value="Bike Race">Bike Race</option>
                <option value="BMX Jam">BMX Jam</option>
                <option value="Group Ride">Group Ride</option>
                <option value="Meet Ups">Meet Ups</option>
                <option value="Other">Other</option>
              </select>
            </label>

            <div className="address-section">
              <label>
                Start Time
                <input
                  type="datetime-local"
                  name="start"
                  onChange={handleChange}
                  required
                  value={formatDateTimeLocal(formData.start)}
                />
              </label>

              <label>
                End Time
                <input
                  type="datetime-local"
                  name="end"
                  onChange={handleChange}
                  required
                  value={formatDateTimeLocal(formData.end)}
                />
              </label>

              <label>
                Street Address
                <input
                  type="text"
                  name="street"
                  placeholder="123 Main St"
                  value={formData.street}
                  required
                  onChange={(e) => {
                    setFormData({ ...formData, street: e.target.value });
                    clearValidation(e);
                  }}
                  onInvalid={(e) => handleValidation(e, "Please enter a valid street address.")}
                />
              </label>

              <label>
                City
                <input
                  type="text"
                  name="city"
                  placeholder="Anytown"
                  value={formData.city}
                  required
                  onChange={(e) => {
                    setFormData({ ...formData, city: e.target.value });
                    clearValidation(e);
                  }}
                  onInvalid={(e) => handleValidation(e, "Please enter a valid city name.")}
                />
              </label>

              <div className="address">
                <StateForm
                  value={formData.state}
                  onChange={(newState) => setFormData({ ...formData, state: newState })}
                />
                <label style={{ marginLeft: 12, flex: 1 }}>
                  Zip Code
                  <input
                    type="text"
                    name="zip"
                    placeholder="12345"
                    value={formData.zip}
                    required
                    onChange={(e) => {
                      setFormData({ ...formData, zip: e.target.value });
                      clearValidation(e);
                    }}
                    onInvalid={(e) => handleValidation(e, "Please enter a valid zip code.")}
                  />
                </label>
              </div>
            </div>

            <label>
              Additional Info
              <textarea
                name="description"
                placeholder="Additional Info"
                value={formData.description}
                onChange={handleChange}
              />
            </label>

            {/* Flyer upload */}
            <div className="flyer-upload-block">
              <div className="flyer-upload-label-row">
                <span>Upload Flyer (Optional)</span>
                {formData.flyer && (
                  <span className="flyer-upload-hint">Re-upload to replace current flyer</span>
                )}
              </div>

              <div className="flyer-upload-row">
                {/* Left: button + drag/drop hint */}
                <div className="flyer-upload-controls">
                  <button
                    type="button"
                    className="flyer-upload-button"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Choose Image
                  </button>
                  <p className="flyer-upload-text">
                    or drag &amp; drop a flyer image here
                  </p>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setUploadError("");
                      setUploading(true);
                      try {
                        const url = await uploadFlyer(file);
                        setFormData((prev) => ({ ...prev, flyer: url }));
                      } catch (err) {
                        setUploadError(err.message || "Upload failed");
                      } finally {
                        setUploading(false);
                      }
                    }}
                  />
                </div>

                {/* Right: thumbnail area (spinner while uploading, image when done) */}
                <div className="flyer-thumb-slot">
                  {uploading ? (
                    // Always show spinner when uploading (even if replacing an existing flyer)
                    <div className="flyer-loading-square">
                      <div className="flyer-spinner" aria-label="Uploading flyer" />
                    </div>
                  ) : formData.flyer ? (
                    // Done uploading: show the current flyer
                    <img
                      src={formData.flyer}
                      alt="Flyer preview"
                      className="flyer-thumb-image"
                    />
                  ) : (
                    // No flyer yet
                    <div className="flyer-empty-square">
                      <span className="flyer-empty-icon">📎</span>
                      <span className="flyer-empty-text">No flyer yet</span>
                    </div>
                  )}
                </div>
              </div>

              {uploadError && (
                <div className="flyer-error-text">
                  {uploadError}
                </div>
              )}
            </div>
          </form>
        </div>

        <div className="ra-modal-footer modal-button">
          <Button type="submit" onClick={handleSubmit}>
            {mode === "edit" ? "Save Changes" : "Add Event"}
          </Button>
          <Button type="button" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>,
    portalEl
  );
};

export default AddEventModal;