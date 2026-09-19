package com.vthacks.studyscheduler.repository;

import com.vthacks.studyscheduler.domain.StudentProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StudentProfileRepository extends JpaRepository<StudentProfile, Long> {

    Optional<StudentProfile> findByName(String name);
}
