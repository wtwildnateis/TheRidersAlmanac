import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import { addMonths, subMonths, startOfToday, startOfMonth, endOfMonth } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";

import AddEventModal from "./EventModal";
import ViewEventModal from "./ViewEventModal";
import CustomToolbar from "./CustomToolbar";

import { useAuthStore } from "../../stores/auth";
import { canEditEvent, canDeleteEvent } from "./CalendarAuth";
import { listEvents, createEvent, updateEvent, deleteEvent } from "../../lib/eventsApi";
import Button from "../Button/Button";

const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

function EventCalendar() {
  const { user, hasAnyRole } = useAuthStore();
  const nav = useNavigate();

  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [eventTypeFilter, setEventTypeFilter] = useState("All");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(false);

  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  // 🔔 login prompt toast (appears only after clicking a slot while logged out)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // auto-hide login prompt after a few seconds
  useEffect(() => {
    if (!showLoginPrompt) return;
    const t = setTimeout(() => setShowLoginPrompt(false), 3500);
    return () => clearTimeout(t);
  }, [showLoginPrompt]);

  // range for current month
  const { from, toDate } = useMemo(
    () => ({ from: startOfMonth(currentDate), toDate: endOfMonth(currentDate) }),
    [currentDate]
  );

  const getNextDate = (action, current) => {
    switch (action) {
      case "TODAY": return startOfToday();
      case "PREV": return subMonths(current, 1);
      case "NEXT": return addMonths(current, 1);
      default: return current;
    }
  };

  // fetch for visible month
  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listEvents({ from: from.toISOString(), to: toDate.toISOString() });
      const mapped = (data || []).map((e) => ({
        ...e,
        start: new Date(e.start),
        end: new Date(e.end),
        location: e.location || [e.street, e.city, e.state, e.zip].filter(Boolean).join(", "),
      }));
      setEvents(mapped);
    } catch (err) {
      console.error("Failed to load events:", err);
    } finally {
      setLoading(false);
    }
  }, [from, toDate]);

  const lastRangeRef = useRef("");
  useEffect(() => {
    const key = `${from.toISOString()}_${toDate.toISOString()}`;
    if (lastRangeRef.current === key) return;
    lastRangeRef.current = key;
    fetchEvents();
  }, [from, toDate, refreshKey, fetchEvents]);

  const filteredEvents =
    eventTypeFilter === "All" ? events : events.filter((e) => e.type === eventTypeFilter);

  const handleDateClick = ({ start }) => {
    // if not logged in, show a toast instead of opening the modal
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }

    const day = new Date(start);
    const today = new Date();
    day.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    if (day < today) return alert("You can't add events to past dates.");
    setSelectedDate(start);
    setShowModal(true);
  };

  const handleSelectedEvent = (event) => setSelectedEvent(event);

  const handleAddEvent = async (newEvent) => {
    try {
      await createEvent({
        ...newEvent,
        start: new Date(newEvent.start).toISOString(),
        end: new Date(newEvent.end).toISOString(),
      });
      setShowModal(false);
      await fetchEvents();
    } catch (e) {
      console.error(e);
      alert("Failed to create event.");
    }
  };

  const handleEditRequest = (eventData) => {
    if (!canEditEvent(eventData, user)) {
      alert("You don't have permission to edit this event.");
      return;
    }
    setSelectedEvent(null);
    setEditingEvent(eventData);
  };

  const handleEditEvent = async (updatedEvent) => {
    try {
      await updateEvent(updatedEvent.id, {
        ...updatedEvent,
        start: new Date(updatedEvent.start).toISOString(),
        end: new Date(updatedEvent.end).toISOString(),
      });
      setEditingEvent(null);
      await fetchEvents();
    } catch (e) {
      console.error(e);
      alert("Failed to update event.");
    }
  };

  const handleDeleteEvent = async (id) => {
    try {
      await deleteEvent(id);
      setSelectedEvent(null);
      await fetchEvents();
    } catch (e) {
      console.error(e);
      alert("Failed to delete event.");
    }
  };

  useEffect(() => {
    function handleOpen(e) {
      const raw = e.detail;
      if (!raw) return;

      const found = events.find((x) => x.id === raw.id);
      if (found) {
        setSelectedEvent(found);
        return;
      }

      setSelectedEvent({
        ...raw,
        start: new Date(raw.start),
        end: new Date(raw.end),
      });
    }

    window.addEventListener("ra:openEvent", handleOpen);
    return () => window.removeEventListener("ra:openEvent", handleOpen);
  }, [events]);

  return (
    <div
      className="ra-calendar-card cal-shell relative"
      style={{ height: "var(--mapHeight)", overflow: "visible" }}  // allow drawer to overflow
    >
      <Calendar
        localizer={localizer}
        events={filteredEvents}
        startAccessor="start"
        endAccessor="end"
        date={currentDate}
        onNavigate={(newDate) => setCurrentDate(newDate)}
        style={{ height: "100%", width: "100%" }}
        selectable          // always selectable so we can intercept clicks
        onSelectSlot={handleDateClick}
        onSelectEvent={handleSelectedEvent}
        dayPropGetter={(d) => {
          const now = new Date(); now.setHours(0, 0, 0, 0);
          const cell = new Date(d); cell.setHours(0, 0, 0, 0);
          return cell < now ? { className: "rbc-day-disabled" } : {};
        }}
        components={{
          toolbar: (props) => (
            <CustomToolbar
              {...props}
              onNavigate={(action) => setCurrentDate(getNextDate(action, currentDate))}
              onTypeFilterChange={setEventTypeFilter}
              currentType={eventTypeFilter}
            />
          ),
        }}
      />

      {loading && (
        <div className="absolute right-2 bottom-2 rounded bg-black/60 px-2.5 py-1.5 text-white text-xs">
          Loading events…
        </div>
      )}

      {/* 🔔 Login prompt toast – only appears after a blocked click */}
      {showLoginPrompt && !user && (
        <div
          className="absolute left-3 bottom-3 rounded bg-black/80 px-3 py-2 text-xs md:text-sm text-white flex flex-col md:flex-row md:items-center gap-2 shadow-lg"
          style={{ zIndex: 40, pointerEvents: "auto" }}              // 👈 make sure it's on top + clickable
          onMouseDown={(e) => e.stopPropagation()}                  // 👈 don't let calendar steal the event
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex-1">
            Login to create your own events.
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" onClick={() => nav("/login")}>
              Go to Login
            </Button>
            <button
              type="button"
              aria-label="Dismiss"
              onClick={() => setShowLoginPrompt(false)}
              className="text-white/70 hover:text-white text-sm"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Only render add/edit modal if logged in */}
      {user && (showModal || editingEvent) && (
        <AddEventModal
          date={editingEvent?.start || selectedDate}
          initialEvent={editingEvent || null}
          onClose={() => {
            setShowModal(false);
            setEditingEvent(null);
          }}
          onSave={async (eventData) => {
            if (editingEvent) {
              await handleEditEvent({ ...eventData, id: editingEvent.id });
            } else {
              await handleAddEvent(eventData);
            }
          }}
          mode={editingEvent ? "edit" : "add"}
        />
      )}

      {selectedEvent && selectedEvent.start && (
        <ViewEventModal
          event={selectedEvent}
          canEdit={canEditEvent(selectedEvent, user)}
          canDelete={canDeleteEvent(selectedEvent, user, hasAnyRole)}
          onClose={() => setSelectedEvent(null)}
          onEditRequest={handleEditRequest}
          onDelete={handleDeleteEvent}
        />
      )}
    </div>
  );
}

export default EventCalendar;