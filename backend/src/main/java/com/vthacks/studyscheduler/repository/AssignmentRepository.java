package com.vthacks.studyscheduler.repository;

import com.vthacks.studyscheduler.domain.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AssignmentRepository extends JpaRepository<Assignment, Long> {

    List<Assignment> findByNameOrderByDueAtAsc(String name);

    List<Assignment> findByNameAndActualHoursIsNotNullOrderByDueAtDesc(String name);
}
