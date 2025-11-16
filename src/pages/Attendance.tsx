// React hooks imported below
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock } from "lucide-react";

import { useEffect, useState } from "react";
import { fetchData } from "@/api/client";

// Attendance data will be loaded from backend /api/attendance

export default function Attendance() {
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [attendanceData, setAttendanceData] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const data = await fetchData<any[]>('/api/attendance');
        if (!mounted) return;
        setAttendanceData(data || []);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to load attendance', err);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  const filteredAttendance = attendanceData.filter((record) => {
    const roleMatch = selectedRole === 'all' || (record.staff_role || record.role) === selectedRole;
    const dateMatch = !selectedDate || String(record.date).startsWith(selectedDate);
    return roleMatch && dateMatch;
  });

  const totalPresent = filteredAttendance.filter((r) => r.status === "present").length;
  const totalAbsent = filteredAttendance.filter((r) => r.status === "absent").length;
  const totalLate = filteredAttendance.filter((r) => r.status === "late").length;
  const totalHours = filteredAttendance.reduce((sum, r) => sum + r.hours, 0);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Attendance Tracker</h1>
        <p className="text-muted-foreground mt-1">Monitor staff attendance and working hours</p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Present</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent">{totalPresent}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Absent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">{totalAbsent}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Late</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-warning">{totalLate}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{totalHours.toFixed(1)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <CardTitle>Daily Attendance</CardTitle>
            <div className="flex gap-3">
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="Manager">Managers</SelectItem>
                  <SelectItem value="Chef">Chefs</SelectItem>
                  <SelectItem value="Captain">Captains</SelectItem>
                  <SelectItem value="Waiter">Waiters</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <Calendar className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredAttendance.map((record) => (
              <div key={record.attendance_id || record.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h4 className="font-semibold text-foreground">{record.staff_name || record.name || 'Unknown'}</h4>
                    <Badge variant="outline" className="text-xs">{record.staff_role || record.role || ''}</Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Check-in: {record.check_in || record.checkIn || '-'}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Check-out: {record.check_out || record.checkOut || '-'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">{Number(record.hours || 0)}h</p>
                    <p className="text-xs text-muted-foreground">Hours</p>
                  </div>
                  <Badge variant={
                    record.status === "present" ? "default" :
                    record.status === "late" ? "secondary" :
                    "outline"
                  } className={
                    record.status === "present" ? "bg-accent text-accent-foreground" :
                    record.status === "late" ? "bg-warning text-warning-foreground" :
                    "text-destructive"
                  }>
                    {record.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
