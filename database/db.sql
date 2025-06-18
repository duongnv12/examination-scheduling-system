-- Database: Examination_Scheduling_System
-- File: db.sql
-- Description: SQL script to create tables for the Examination Scheduling System.
-- Designed for PostgreSQL.
--

-- --- Drop existing tables to ensure a clean slate for recreation ---
-- (Use with caution in production environments. CASCADE will drop dependent objects.)
DROP TABLE IF EXISTS "ExamInvigilators" CASCADE;

DROP TABLE IF EXISTS "ExamSchedules" CASCADE;

DROP TABLE IF EXISTS "CourseRegistrations" CASCADE;

DROP TABLE IF EXISTS "Students" CASCADE;
-- Đặt Students trước Lecturers nếu có phụ thuộc ngược lại
DROP TABLE IF EXISTS "Lecturers" CASCADE;

DROP TABLE IF EXISTS "Courses" CASCADE;

DROP TABLE IF EXISTS "Departments" CASCADE;
-- Bảng mới
DROP TABLE IF EXISTS "Rooms" CASCADE;

---

-- 1. Table: Rooms
-- Stores information about available examination rooms.
CREATE TABLE "Rooms" (
    "room_id" UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    "room_name" VARCHAR(100) NOT NULL UNIQUE,
    "capacity" INTEGER NOT NULL CHECK (capacity > 0),
    "room_type" VARCHAR(50) NOT NULL, -- e.g., 'Phòng lý thuyết', 'Phòng máy tính', 'Phòng lab'
    "description" TEXT,
    "is_active" BOOLEAN DEFAULT TRUE,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE "Rooms" IS 'Thông tin về các phòng thi';

COMMENT ON COLUMN "Rooms"."room_id" IS 'Mã định danh duy nhất của phòng';

COMMENT ON COLUMN "Rooms"."room_name" IS 'Tên hoặc số hiệu của phòng';

COMMENT ON COLUMN "Rooms"."capacity" IS 'Sức chứa tối đa của phòng';

COMMENT ON COLUMN "Rooms"."room_type" IS 'Loại phòng (ví dụ: lý thuyết, máy tính, lab)';

COMMENT ON COLUMN "Rooms"."createdAt" IS 'Thời điểm tạo bản ghi';

COMMENT ON COLUMN "Rooms"."updatedAt" IS 'Thời điểm cập nhật bản ghi cuối cùng';

---

-- 2. Table: Departments
-- Stores information about academic departments/faculties.
CREATE TABLE "Departments" (
    "department_id" UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    "department_name" VARCHAR(255) NOT NULL UNIQUE,
    "department_code" VARCHAR(50) NOT NULL UNIQUE,
    "description" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE "Departments" IS 'Thông tin về các khoa/phòng ban';

COMMENT ON COLUMN "Departments"."department_id" IS 'Mã định danh duy nhất của khoa';

COMMENT ON COLUMN "Departments"."department_name" IS 'Tên đầy đủ của khoa';

COMMENT ON COLUMN "Departments"."department_code" IS 'Mã viết tắt của khoa';

---

-- 3. Table: Courses
-- Stores information about academic courses/subjects.
CREATE TABLE "Courses" (
    "course_id" UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    "course_code" VARCHAR(50) NOT NULL UNIQUE,
    "course_name" VARCHAR(255) NOT NULL,
    "credit_hours" INTEGER NOT NULL CHECK (credit_hours > 0), -- Đổi từ "credits" thành "credit_hours" để khớp với model
    "exam_duration_minutes" INTEGER NOT NULL CHECK (exam_duration_minutes > 0), -- Thời lượng thi bằng phút
    "exam_format" VARCHAR(50) NOT NULL, -- e.g., 'Trắc nghiệm', 'Tự luận', 'Vấn đáp', 'Thực hành'
    "department_id" UUID NOT NULL, -- Khóa ngoại tới Departments
    "total_students_registered" INTEGER DEFAULT 0, -- Sẽ được cập nhật từ CourseRegistrations
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    FOREIGN KEY ("department_id") REFERENCES "Departments" ("department_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

COMMENT ON TABLE "Courses" IS 'Thông tin về các môn học';

COMMENT ON COLUMN "Courses"."course_id" IS 'Mã định danh duy nhất của môn học';

COMMENT ON COLUMN "Courses"."course_code" IS 'Mã môn học (ví dụ: INT1001)';

COMMENT ON COLUMN "Courses"."course_name" IS 'Tên môn học';

COMMENT ON COLUMN "Courses"."credit_hours" IS 'Số tín chỉ';

COMMENT ON COLUMN "Courses"."exam_duration_minutes" IS 'Thời lượng thi tính bằng phút';

COMMENT ON COLUMN "Courses"."exam_format" IS 'Hình thức thi (ví dụ: trắc nghiệm, tự luận)';

COMMENT ON COLUMN "Courses"."department_id" IS 'Mã định danh của khoa quản lý môn học này';

---

-- 4. Table: Students
-- Stores information about students.
CREATE TABLE "Students" (
    "student_id" UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    "student_code" VARCHAR(50) NOT NULL UNIQUE,
    "full_name" VARCHAR(255) NOT NULL,
    "gender" VARCHAR(10) NOT NULL CHECK (
        gender IN ('Nam', 'Nữ', 'Khác')
    ), -- Thêm trường gender
    "date_of_birth" DATE NOT NULL, -- Đổi thành NOT NULL
    "class_name" VARCHAR(100),
    "email" VARCHAR(255) NOT NULL UNIQUE, -- Đổi thành NOT NULL
    "phone_number" VARCHAR(20),
    "address" VARCHAR(255), -- Thêm trường address
    "department_id" UUID NOT NULL, -- Thêm khóa ngoại
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    FOREIGN KEY ("department_id") REFERENCES "Departments" ("department_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

COMMENT ON TABLE "Students" IS 'Thông tin về sinh viên';

COMMENT ON COLUMN "Students"."student_id" IS 'Mã định danh duy nhất của sinh viên';

COMMENT ON COLUMN "Students"."student_code" IS 'Mã số sinh viên';

COMMENT ON COLUMN "Students"."full_name" IS 'Họ và tên sinh viên';

COMMENT ON COLUMN "Students"."gender" IS 'Giới tính của sinh viên (Nam, Nữ, Khác)';

COMMENT ON COLUMN "Students"."date_of_birth" IS 'Ngày sinh của sinh viên';

COMMENT ON COLUMN "Students"."class_name" IS 'Lớp học của sinh viên (ví dụ: K18PM1)';

COMMENT ON COLUMN "Students"."email" IS 'Địa chỉ email của sinh viên';

COMMENT ON COLUMN "Students"."phone_number" IS 'Số điện thoại của sinh viên';

COMMENT ON COLUMN "Students"."address" IS 'Địa chỉ hiện tại của sinh viên';

COMMENT ON COLUMN "Students"."department_id" IS 'Mã định danh của khoa mà sinh viên thuộc về';

COMMENT ON COLUMN "Students"."createdAt" IS 'Thời điểm tạo bản ghi';

COMMENT ON COLUMN "Students"."updatedAt" IS 'Thời điểm cập nhật bản ghi cuối cùng';

---

-- 5. Table: Lecturers
-- Stores information about lecturers/staff members who can be invigilators.
-- Renamed from "Faculty" and linked to "Departments".
CREATE TABLE "Lecturers" (
    "lecturer_id" UUID PRIMARY KEY DEFAULT gen_random_uuid (), -- Đổi từ "faculty_id"
    "lecturer_code" VARCHAR(50) NOT NULL UNIQUE, -- Đổi từ "faculty_code"
    "full_name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL UNIQUE, -- Thêm email
    "phone_number" VARCHAR(20), -- Thêm phone_number
    "department_id" UUID NOT NULL, -- Thêm khóa ngoại tới Departments
    "is_available_for_invigilation" BOOLEAN DEFAULT TRUE, -- Trạng thái sẵn sàng coi thi
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    FOREIGN KEY ("department_id") REFERENCES "Departments" ("department_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

COMMENT ON TABLE "Lecturers" IS 'Thông tin về giảng viên/cán bộ (có thể là giám thị)';

COMMENT ON COLUMN "Lecturers"."lecturer_id" IS 'Mã định danh duy nhất của giảng viên';

COMMENT ON COLUMN "Lecturers"."lecturer_code" IS 'Mã giảng viên';

COMMENT ON COLUMN "Lecturers"."full_name" IS 'Họ và tên giảng viên';

COMMENT ON COLUMN "Lecturers"."email" IS 'Địa chỉ email của giảng viên';

COMMENT ON COLUMN "Lecturers"."phone_number" IS 'Số điện thoại của giảng viên';

COMMENT ON COLUMN "Lecturers"."department_id" IS 'Mã định danh của khoa mà giảng viên thuộc về';

COMMENT ON COLUMN "Lecturers"."is_available_for_invigilation" IS 'Trạng thái sẵn sàng coi thi của giảng viên';

COMMENT ON COLUMN "Lecturers"."createdAt" IS 'Thời điểm tạo bản ghi';

COMMENT ON COLUMN "Lecturers"."updatedAt" IS 'Thời điểm cập nhật bản ghi cuối cùng';

---

-- 6. Table: CourseRegistrations
-- Links students to courses they have registered for in a specific semester.
CREATE TABLE "CourseRegistrations" (
    "registration_id" UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    "student_id" UUID NOT NULL REFERENCES "Students" ("student_id") ON DELETE CASCADE ON UPDATE CASCADE,
    "course_id" UUID NOT NULL REFERENCES "Courses" ("course_id") ON DELETE CASCADE ON UPDATE CASCADE,
    "semester" VARCHAR(50) NOT NULL, -- e.g., '2024-2025_HK1'
    "registration_date" DATE NOT NULL DEFAULT CURRENT_DATE, -- Thêm cột ngày đăng ký
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT "UQ_StudentCourseSemester" UNIQUE (
        "student_id",
        "course_id",
        "semester"
    )
);

COMMENT ON TABLE "CourseRegistrations" IS 'Lịch sử đăng ký môn học của sinh viên theo kỳ';

COMMENT ON COLUMN "CourseRegistrations"."registration_id" IS 'Mã định danh duy nhất của đăng ký';

COMMENT ON COLUMN "CourseRegistrations"."semester" IS 'Kỳ học mà sinh viên đăng ký môn này';

---

-- 7. Table: ExamSchedules
-- Stores the main examination schedule entries.
CREATE TABLE "ExamSchedules" (
    "schedule_id" UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    "course_id" UUID NOT NULL REFERENCES "Courses" ("course_id") ON DELETE CASCADE ON UPDATE CASCADE,
    "room_id" UUID NOT NULL REFERENCES "Rooms" ("room_id") ON DELETE CASCADE ON UPDATE CASCADE,
    "exam_date" DATE NOT NULL,
    "exam_slot" VARCHAR(50) NOT NULL, -- e.g., 'Ca 1', 'Ca 2', 'Ca 3'
    "start_time" VARCHAR(50) NOT NULL, -- Đổi từ TIME sang VARCHAR để khớp với Model
    "end_time" VARCHAR(50) NOT NULL, -- Đổi từ TIME sang VARCHAR để khớp với Model
    "scheduled_students_count" INTEGER NOT NULL CHECK (scheduled_students_count > 0), -- Số lượng SV dự kiến thi tại phòng này
    "semester" VARCHAR(50) NOT NULL, -- Thêm cột học kỳ
    "exam_type" VARCHAR(50) NOT NULL, -- Thêm loại kỳ thi (ví dụ: 'Final', 'Midterm')
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT "UQ_RoomDateSlot" UNIQUE (
        "room_id",
        "exam_date",
        "exam_slot"
    ), -- Một phòng chỉ có thể được sử dụng một lần trong một ca/ngày
    CONSTRAINT "UQ_CourseDateSlot" UNIQUE (
        "course_id",
        "exam_date",
        "exam_slot"
    ) -- Một môn chỉ thi một lần trong một ca/ngày
    -- Removed CHK_ExamTime as it's harder to enforce with VARCHAR times, will be handled by application logic
);

COMMENT ON TABLE "ExamSchedules" IS 'Lịch thi chi tiết cho từng môn học và phòng';

COMMENT ON COLUMN "ExamSchedules"."schedule_id" IS 'Mã định danh duy nhất của lịch thi';

COMMENT ON COLUMN "ExamSchedules"."exam_slot" IS 'Ca thi (ví dụ: Ca 1, Ca 2)';

COMMENT ON COLUMN "ExamSchedules"."scheduled_students_count" IS 'Số lượng sinh viên dự kiến thi trong ca này tại phòng này';

COMMENT ON COLUMN "ExamSchedules"."semester" IS 'Học kỳ của kỳ thi';

COMMENT ON COLUMN "ExamSchedules"."exam_type" IS 'Loại kỳ thi (ví dụ: Final, Midterm)';

---

-- 8. Table: ExamInvigilators
-- Links exam schedules to the lecturers assigned as invigilators.
CREATE TABLE "ExamInvigilators" (
    "invigilator_id" UUID PRIMARY KEY DEFAULT gen_random_uuid (), -- Đổi từ "exam_invigilator_id" cho nhất quán
    "schedule_id" UUID NOT NULL REFERENCES "ExamSchedules" ("schedule_id") ON DELETE CASCADE ON UPDATE CASCADE,
    "lecturer_id" UUID NOT NULL REFERENCES "Lecturers" ("lecturer_id") ON DELETE CASCADE ON UPDATE CASCADE, -- Đổi từ "faculty_id" và REFERENCES "Lecturers"
    "role" VARCHAR(100), -- Ví dụ: 'Giám thị 1', 'Giám thị 2', 'Cán bộ phòng thi' (thêm cột này để linh hoạt hơn)
    "invigilator_order" INTEGER NOT NULL DEFAULT 1 CHECK (invigilator_order IN (1, 2)), -- 1 for Giám thị 1, 2 for Giám thị 2
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT "UQ_ScheduleLecturer" UNIQUE ("schedule_id", "lecturer_id"), -- Đảm bảo một giảng viên chỉ coi thi một lần cho một ca thi cụ thể
    CONSTRAINT "UQ_ScheduleOrder" UNIQUE (
        "schedule_id",
        "invigilator_order"
    ) -- Đảm bảo chỉ có 1 giám thị 1 và 1 giám thị 2 cho mỗi lịch
);

COMMENT ON TABLE "ExamInvigilators" IS 'Phân công giám thị cho các lịch thi';

COMMENT ON COLUMN "ExamInvigilators"."invigilator_id" IS 'Mã định danh duy nhất của phân công giám thị';

COMMENT ON COLUMN "ExamInvigilators"."invigilator_order" IS 'Thứ tự giám thị (1 hoặc 2)';

COMMENT ON COLUMN "ExamInvigilators"."role" IS 'Vai trò của giám thị trong ca thi (Giám thị 1, Giám thị 2, v.v.)';

---

-- Optional: Indexes for performance optimization
CREATE INDEX idx_students_student_code ON "Students" ("student_code");

CREATE INDEX idx_students_department_id ON "Students" ("department_id");
-- Thêm index cho khóa ngoại mới

CREATE INDEX idx_courses_course_code ON "Courses" ("course_code");

CREATE INDEX idx_courses_department_id ON "Courses" ("department_id");

CREATE INDEX idx_rooms_room_name ON "Rooms" ("room_name");

CREATE INDEX idx_lecturers_lecturer_code ON "Lecturers" ("lecturer_code");

CREATE INDEX idx_lecturers_department_id ON "Lecturers" ("department_id");

CREATE INDEX idx_departments_department_code ON "Departments" ("department_code");

CREATE INDEX idx_courseregistrations_student_id ON "CourseRegistrations" ("student_id");

CREATE INDEX idx_courseregistrations_course_id ON "CourseRegistrations" ("course_id");

CREATE INDEX idx_examschedules_exam_date_slot ON "ExamSchedules" ("exam_date", "exam_slot");

CREATE INDEX idx_examschedules_course_id ON "ExamSchedules" ("course_id");

CREATE INDEX idx_examschedules_room_id ON "ExamSchedules" ("room_id");

CREATE INDEX idx_examinvigilators_schedule_id ON "ExamInvigilators" ("schedule_id");

CREATE INDEX idx_examinvigilators_lecturer_id ON "ExamInvigilators" ("lecturer_id");