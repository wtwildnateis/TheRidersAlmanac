import EventCalendar from "../components/Calendar/Calendar";
import UpcomingSidebar from "../components/Calendar/UpcomingSidebar";

function CalendarPage() {
  return (
    <div className="min-h-dvh bg-[var(--page-bg)] text-[var(--ink)]">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 py-8">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-wide mb-6">Events Calendar</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-6 items-start">
          {/* Calendar card */}
          <div className="relative rounded-[14px] border border-[var(--ring)] shadow-[var(--shadow)] bg-[var(--panel)] overflow-hidden">
            <div className="h-[clamp(520px,72vh,780px)]">
              <EventCalendar />
            </div>
          </div>

          {/* Upcoming card */}
          <aside className="rounded-[14px] border border-[var(--ring)] shadow-[var(--shadow)] bg-[var(--panel)]">
            <div className="p-4">
              <div className="w-full px-3 py-1.5 text-[20px] font-black tracking-wider text-[var(--accent)]">UPCOMING</div>
              <UpcomingSidebar />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
export default CalendarPage;
