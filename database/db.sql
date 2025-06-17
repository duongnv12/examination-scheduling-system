--
-- Database: Examination_Scheduling_System
--
-- File: db.sql
-- Description: SQL script to create tables for the Examination Scheduling System.
-- Designed for PostgreSQL.
--

-- --- Drop existing tables to ensure a clean slate for recreation ---
-- (Use with caution in production environments)
DROP TABLE IF EXISTS "ExamInvigilators" CASCADE;
DROP TABLE IF EXISTS "ExamSchedules" CASCADE;
DROP TABLE IF EXISTS "CourseRegistrations" CASCADE;
DROP TABLE IF EXISTS "Faculty" CASCADE;
DROP TABLE IF EXISTS "Students" CASCADE;
DROP TABLE IF EXISTS "Courses" CASCADE;
DROP TABLE IF EXISTS "Rooms" CASCADE;

---

-- 1. Table: Rooms
-- Stores information about available examination rooms.
CREATE TABLE "Rooms" (
    "room_id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "room_name" VARCHAR(100) NOT NULL UNIQUE,
    "capacity" INTEGER NOT NULL CHECK (capacity > 0),
    "room_type" VARCHAR(50) NOT NULL, -- e.g., 'Phòng lý thuyết', 'Phòng máy tính', 'Phòng lab'
    "description" TEXT,
    "is_active" BOOLEAN DEFAULT TRUE
);

COMMENT ON TABLE "Rooms" IS 'Thông tin về các phòng thi';
COMMENT ON COLUMN "Rooms"."room_id" IS 'Mã định danh duy nhất của phòng';
COMMENT ON COLUMN "Rooms"."room_name" IS 'Tên hoặc số hiệu của phòng';
COMMENT ON COLUMN "Rooms"."capacity" IS 'Sức chứa tối đa của phòng';
COMMENT ON COLUMN "Rooms"."room_type" IS 'Loại phòng (ví dụ: lý thuyết, máy tính, lab)';

---

-- 2. Table: Courses
-- Stores information about academic courses/subjects.
CREATE TABLE "Courses" (
    "course_id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "course_code" VARCHAR(50) NOT NULL UNIQUE,
    "course_name" VARCHAR(255) NOT NULL,
    "credits" INTEGER NOT NULL CHECK (credits > 0),
    "exam_duration_minutes" INTEGER NOT NULL CHECK (exam_duration_minutes > 0), -- Thời lượng thi bằng phút
    "exam_format" VARCHAR(50) NOT NULL, -- e.g., 'Trắc nghiệm', 'Tự luận', 'Vấn đáp', 'Thực hành'
    "total_students_registered" INTEGER DEFAULT 0 -- Sẽ được cập nhật từ CourseRegistrations
);

COMMENT ON TABLE "Courses" IS 'Thông tin về các môn học';
COMMENT ON COLUMN "Courses"."course_id" IS 'Mã định danh duy nhất của môn học';
COMMENT ON COLUMN "Courses"."course_code" IS 'Mã môn học (ví dụ: INT1001)';
COMMENT ON COLUMN "Courses"."course_name" IS 'Tên môn học';
COMMENT ON COLUMN "Courses"."credits" IS 'Số tín chỉ';
COMMENT ON COLUMN "Courses"."exam_duration_minutes" IS 'Thời lượng thi tính bằng phút';
COMMENT ON COLUMN "Courses"."exam_format" IS 'Hình thức thi (ví dụ: trắc nghiệm, tự luận)';

---

-- 3. Table: Students
-- Stores information about students.
CREATE TABLE "Students" (
    "student_id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "student_code" VARCHAR(50) NOT NULL UNIQUE,
    "full_name" VARCHAR(255) NOT NULL,
    "date_of_birth" DATE,
    "class_name" VARCHAR(100) -- Lớp học của sinh viên
);

COMMENT ON TABLE "Students" IS 'Thông tin về sinh viên';
COMMENT ON COLUMN "Students"."student_id" IS 'Mã định danh duy nhất của sinh viên';
COMMENT ON COLUMN "Students"."student_code" IS 'Mã số sinh viên';
COMMENT ON COLUMN "Students"."full_name" IS 'Họ và tên sinh viên';

---

-- 4. Table: Faculty
-- Stores information about faculty members who can be invigilators.
CREATE TABLE "Faculty" (
    "faculty_id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "faculty_code" VARCHAR(50) NOT NULL UNIQUE, -- Mã cán bộ/giảng viên
    "full_name" VARCHAR(255) NOT NULL,
    "department" VARCHAR(100),
    "is_available_for_invigilation" BOOLEAN DEFAULT TRUE -- Trạng thái sẵn sàng coi thi
);

COMMENT ON TABLE "Faculty" IS 'Thông tin về cán bộ/giảng viên (có thể là giám thị)';
COMMENT ON COLUMN "Faculty"."faculty_id" IS 'Mã định danh duy nhất của cán bộ/giảng viên';
COMMENT ON COLUMN "Faculty"."faculty_code" IS 'Mã cán bộ/giảng viên';
COMMENT ON COLUMN "Faculty"."full_name" IS 'Họ và tên cán bộ/giảng viên';

---

-- 5. Table: CourseRegistrations
-- Links students to courses they have registered for in a specific semester.
CREATE TABLE "CourseRegistrations" (
    "registration_id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "student_id" UUID NOT NULL REFERENCES "Students"("student_id"),
    "course_id" UUID NOT NULL REFERENCES "Courses"("course_id"),
    "semester" VARCHAR(50) NOT NULL, -- e.g., '2024-2025_HK1'
    CONSTRAINT "UQ_StudentCourseSemester" UNIQUE ("student_id", "course_id", "semester")
);

COMMENT ON TABLE "CourseRegistrations" IS 'Lịch sử đăng ký môn học của sinh viên theo kỳ';
COMMENT ON COLUMN "CourseRegistrations"."registration_id" IS 'Mã định danh duy nhất của đăng ký';
COMMENT ON COLUMN "CourseRegistrations"."semester" IS 'Kỳ học mà sinh viên đăng ký môn này';

---

-- 6. Table: ExamSchedules
-- Stores the main examination schedule entries.
CREATE TABLE "ExamSchedules" (
    "schedule_id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "course_id" UUID NOT NULL REFERENCES "Courses"("course_id"),
    "room_id" UUID NOT NULL REFERENCES "Rooms"("room_id"),
    "exam_date" DATE NOT NULL,
    "exam_slot" VARCHAR(50) NOT NULL, -- e.g., 'Ca 1', 'Ca 2', 'Ca 3'
    "start_time" TIME NOT NULL,
    "end_time" TIME NOT NULL,
    "scheduled_students_count" INTEGER NOT NULL CHECK (scheduled_students_count > 0), -- Số lượng SV dự kiến thi tại phòng này
    CONSTRAINT "UQ_RoomDateSlot" UNIQUE ("room_id", "exam_date", "exam_slot"), -- Một phòng chỉ có thể được sử dụng một lần trong một ca/ngày
    CONSTRAINT "UQ_CourseDateSlot" UNIQUE ("course_id", "exam_date", "exam_slot"), -- Một môn chỉ thi một lần trong một ca/ngày
    CONSTRAINT "CHK_ExamTime" CHECK (start_time < end_time)
);

COMMENT ON TABLE "ExamSchedules" IS 'Lịch thi chi tiết cho từng môn học và phòng';
COMMENT ON COLUMN "ExamSchedules"."schedule_id" IS 'Mã định danh duy nhất của lịch thi';
COMMENT ON COLUMN "ExamSchedules"."exam_slot" IS 'Ca thi (ví dụ: Ca 1, Ca 2)';
COMMENT ON COLUMN "ExamSchedules"."scheduled_students_count" IS 'Số lượng sinh viên dự kiến thi trong ca này tại phòng này';

---

-- 7. Table: ExamInvigilators
-- Links exam schedules to the faculty members assigned as invigilators.
-- Each schedule_id should be linked to exactly two faculty_id entries.
CREATE TABLE "ExamInvigilators" (
    "exam_invigilator_id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "schedule_id" UUID NOT NULL REFERENCES "ExamSchedules"("schedule_id"),
    "faculty_id" UUID NOT NULL REFERENCES "Faculty"("faculty_id"),
    "invigilator_order" INTEGER NOT NULL CHECK (invigilator_order IN (1, 2)), -- 1 for Giám thị 1, 2 for Giám thị 2
    CONSTRAINT "UQ_ScheduleFaculty" UNIQUE ("schedule_id", "faculty_id"), -- Một giám thị chỉ coi thi một lần cho một ca thi cụ thể
    CONSTRAINT "UQ_ScheduleOrder" UNIQUE ("schedule_id", "invigilator_order") -- Đảm bảo chỉ có 1 giám thị 1 và 1 giám thị 2 cho mỗi lịch
);

COMMENT ON TABLE "ExamInvigilators" IS 'Phân công giám thị cho các lịch thi';
COMMENT ON COLUMN "ExamInvigilators"."exam_invigilator_id" IS 'Mã định danh duy nhất của phân công giám thị';
COMMENT ON COLUMN "ExamInvigilators"."invigilator_order" IS 'Thứ tự giám thị (1 hoặc 2)';

---

-- Optional: Indexes for performance optimization
CREATE INDEX idx_students_student_code ON "Students" ("student_code");
CREATE INDEX idx_courses_course_code ON "Courses" ("course_code");
CREATE INDEX idx_rooms_room_name ON "Rooms" ("room_name");
CREATE INDEX idx_faculty_faculty_code ON "Faculty" ("faculty_code");
CREATE INDEX idx_courseregistrations_student_id ON "CourseRegistrations" ("student_id");
CREATE INDEX idx_courseregistrations_course_id ON "CourseRegistrations" ("course_id");
CREATE INDEX idx_examschedules_exam_date_slot ON "ExamSchedules" ("exam_date", "exam_slot");
CREATE INDEX idx_examschedules_course_id ON "ExamSchedules" ("course_id");
CREATE INDEX idx_examschedules_room_id ON "ExamSchedules" ("room_id");
CREATE INDEX idx_examinvigilators_schedule_id ON "ExamInvigilators" ("schedule_id");
CREATE INDEX idx_examinvigilators_faculty_id ON "ExamInvigilators" ("faculty_id");