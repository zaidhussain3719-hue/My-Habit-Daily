import { Habit, UserProfile } from '../types';
import { calculateHabitStreak } from './storageService';

export function exportHabitsToCSV(habits: Habit[]) {
  const rows = [
    ['Habit ID', 'Title', 'Category', 'Frequency', 'Target Value', 'Unit', 'Reminder Time', 'Archived', 'Date', 'Logged Count', 'Completed', 'Notes']
  ];

  habits.forEach(habit => {
    const dates = Object.keys(habit.logs);
    if (dates.length === 0) {
      rows.push([
        habit.id,
        `"${habit.title.replace(/"/g, '""')}"`,
        habit.category,
        habit.frequency,
        String(habit.targetValue),
        habit.unit,
        habit.reminderTime || '',
        String(habit.archived),
        '',
        '0',
        'false',
        ''
      ]);
    } else {
      dates.forEach(date => {
        const log = habit.logs[date];
        rows.push([
          habit.id,
          `"${habit.title.replace(/"/g, '""')}"`,
          habit.category,
          habit.frequency,
          String(habit.targetValue),
          habit.unit,
          habit.reminderTime || '',
          String(habit.archived),
          date,
          String(log.count),
          String(log.completed),
          `"${(log.notes || '').replace(/"/g, '""')}"`
        ]);
      });
    }
  });

  const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `MyHabitDaily_Report_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export function exportHabitsToPDF(habits: Habit[], profile: UserProfile) {
  const activeHabits = habits.filter(h => !h.archived);
  const totalActive = activeHabits.length;
  
  let totalCompletions = 0;
  let maxStreak = 0;
  activeHabits.forEach(h => {
    Object.values(h.logs).forEach(l => {
      if (l.completed) totalCompletions++;
    });
    const s = calculateHabitStreak(h).currentStreak;
    if (s > maxStreak) maxStreak = s;
  });

  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>My Habit Daily - Performance Report</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #0f172a; max-width: 800px; margin: 0 auto; }
          .header { border-bottom: 2px solid #10b981; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; }
          h1 { color: #065f46; margin: 0; font-size: 24px; }
          .subtitle { color: #64748b; font-size: 13px; margin-top: 4px; }
          .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 32px; }
          .stat-card { background: #f0fdf4; border: 1px solid #a7f3d0; border-radius: 12px; padding: 16px; text-align: center; }
          .stat-value { font-size: 28px; font-weight: 800; color: #047857; }
          .stat-label { font-size: 11px; text-transform: uppercase; color: #065f46; font-weight: 700; margin-top: 4px; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; }
          th, td { text-align: left; padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
          th { background-color: #f8fafc; color: #475569; font-weight: 700; text-transform: uppercase; font-size: 11px; }
          tr:nth-child(even) { background-color: #f8fafc; }
          .badge { display: inline-block; padding: 3px 8px; border-radius: 9999px; font-size: 10px; font-weight: 700; background: #d1fae5; color: #065f46; }
          .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; pt: 16px; text-align: center; font-size: 11px; color: #94a3b8; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1>My Habit Daily - Performance Report</h1>
            <div class="subtitle">Generated for ${profile.name} (${profile.email}) on ${new Date().toLocaleDateString()}</div>
          </div>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">${totalActive}</div>
            <div class="stat-label">Active Routines</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${totalCompletions}</div>
            <div class="stat-label">Total Completions</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${maxStreak} Days</div>
            <div class="stat-label">Current Max Streak</div>
          </div>
        </div>

        <h2>Habit Routines Summary</h2>
        <table>
          <thead>
            <tr>
              <th>Habit Name</th>
              <th>Category</th>
              <th>Target</th>
              <th>Current Streak</th>
              <th>Best Streak</th>
              <th>Reminder Time</th>
            </tr>
          </thead>
          <tbody>
            ${activeHabits.map(h => {
              const { currentStreak, bestStreak } = calculateHabitStreak(h);
              return `
                <tr>
                  <td><strong>${h.title}</strong></td>
                  <td><span class="badge">${h.category}</span></td>
                  <td>${h.targetValue} ${h.unit} / ${h.frequency}</td>
                  <td>${currentStreak} days 🔥</td>
                  <td>${bestStreak} days 🏆</td>
                  <td>${h.reminderTimes?.join(', ') || h.reminderTime || 'Off'}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>

        <div class="footer">
          My Habit Daily • Material 3 Android Habit Tracking Engine • Confidential Report
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
