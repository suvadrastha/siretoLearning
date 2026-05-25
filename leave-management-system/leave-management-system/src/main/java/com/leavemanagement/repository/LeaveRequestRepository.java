package com.leavemanagement.repository;

import com.leavemanagement.enums.LeaveStatus;
import com.leavemanagement.model.LeaveRequest;
import com.leavemanagement.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {

    List<LeaveRequest> findByEmployeeOrderByRequestIdDesc(User employee);

    List<LeaveRequest> findByEmployeeAndStatusOrderByRequestIdDesc(
            User employee,
            LeaveStatus status
    );
    List<LeaveRequest> findAllByOrderByRequestIdDesc();

    List<LeaveRequest> findByStatusOrderByRequestIdDesc(LeaveStatus status);

    long countByStatus(LeaveStatus status);

    long countByEmployee(User employee);

    long countByEmployeeAndStatus(User employee, LeaveStatus status);

    List<LeaveRequest> findByStatusAndStartDateGreaterThanEqualAndEmployeeNotOrderByStartDateAsc(
            LeaveStatus status,
            LocalDate startDate,
            User employee
    );

    List<LeaveRequest> findByEmployeeUsernameContainingIgnoreCaseOrderByRequestIdDesc(String username);

    List<LeaveRequest> findByEmployeeUsernameContainingIgnoreCaseAndStatusOrderByRequestIdDesc(
            String username,
            LeaveStatus status
    );

}