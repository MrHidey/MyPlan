import React from 'react';
import {
  LineChart, Line,
  BarChart, Bar,
  XAxis, YAxis,
  Tooltip, CartesianGrid,
  ResponsiveContainer,
  Legend
} from 'recharts';

const DashboardCharts = ({ notes }) => {

  // Group downloads by subject
  const groupDownloadsBySubject = (notes) => {
    const subjectMap = {};
  
    notes.forEach(note => {
      const subject = note.subject?.toUpperCase();
      const downloads = Number(note.downloadCount) || 0; // Ensure it's a number
  
      if (subject in subjectMap) {
        subjectMap[subject] += downloads;
      } else {
        subjectMap[subject] = downloads;
      }
    });
  
    return Object.entries(subjectMap).map(([subject, downloads]) => ({
      name: subject,
      downloads
    }));
  };
  
  const downloadData = groupDownloadsBySubject(notes);

  // Group uploads by date
  const uploadTrend = notes.map(note => ({
    date: new Date(note.createdAt).toLocaleDateString(),
    count: 1,
  }));

  const uploadsByDate = Object.values(
    uploadTrend.reduce((acc, cur) => {
      acc[cur.date] = acc[cur.date] || { date: cur.date, count: 0 };
      acc[cur.date].count += 1;
      return acc;
    }, {})
  );

  return (
    <div style={{ marginTop: '40px' }}>
      <h2 style={{ marginBottom: '10px' }}>Analytics Overview</h2>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px' }}>
        {/* Downloads Chart */}
        <div style={{ flex: 1, minWidth: '300px' }}>
          <h4>Downloads per Subject</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={downloadData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="downloads" fill="#3f51b5" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Uploads Chart */}
        <div style={{ flex: 1, minWidth: '300px' }}>
          <h4>Uploads Over Time</h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={uploadsByDate}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#00C49F" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;
