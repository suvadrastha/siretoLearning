package com.leavemanagement.service;

import com.leavemanagement.dto.ApplyLeaveRequest;
import com.leavemanagement.dto.ReviewLeaveRequest;
import com.leavemanagement.enums.LeaveStatus;
import com.leavemanagement.enums.Role;
import com.leavemanagement.model.LeaveRequest;
import com.leavemanagement.model.User;
import com.leavemanagement.repository.LeaveRequestRepository;
import com.leavemanagement.repository.UserRepository;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import com.leavemanagement.dto.LeaveStatisticsResponse;
import com.leavemanagement.enums.LeaveStatus;

import java.time.LocalDate;
import java.util.List;

@Service
public class LeaveRequestService {

    private final LeaveRequestRepository leaveRequestRepository;
    private final UserRepository userRepository;

    public LeaveRequestService(
            LeaveRequestRepository leaveRequestRepository,
            UserRepository userRepository
    ) {
        this.leaveRequestRepository = leaveRequestRepository;
        this.userRepository = userRepository;
    }

    public LeaveRequest applyLeave(ApplyLeaveRequest request, Jwt jwt) {

        User employee = getCurrentUser(jwt);

        if (employee.getRole() != Role.ROLE_USER) {
            throw new RuntimeException("Only employees can apply for leave");
        }

        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new RuntimeException("End date cannot be before start date");
        }

        LeaveRequest leaveRequest = LeaveRequest.builder()
                .employee(employee)
                .leaveType(request.getLeaveType())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .reason(request.getReason())
                .status(LeaveStatus.PENDING)
                .build();

        return leaveRequestRepository.save(leaveRequest);
    }

    public List<LeaveRequest> getMyLeaveRequests(Jwt jwt, LeaveStatus status) {

        User employee = getCurrentUser(jwt);

        if (status != null) {
            return leaveRequestRepository
                    .findByEmployeeAndStatusOrderByRequestIdDesc(employee, status);
        }

        return leaveRequestRepository.findByEmployeeOrderByRequestIdDesc(employee);
    }

    private User getCurrentUser(Jwt jwt) {
        String keycloakUserId = jwt.getSubject();

        return userRepository.findByKeycloakUserId(keycloakUserId)
                .orElseThrow(() -> new RuntimeException("User not found in database"));
    }

    public LeaveRequest reviewLeave(Long requestId, ReviewLeaveRequest request, Jwt jwt) {

        User reviewer = getCurrentUser(jwt);

        if (reviewer.getRole() != Role.ROLE_ADMIN) {
            throw new RuntimeException("Only manager can approve or reject leave");
        }

        LeaveRequest leaveRequest = leaveRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Leave request not found"));

        if (leaveRequest.getStatus() != LeaveStatus.PENDING) {
            throw new RuntimeException("Only pending leave requests can be reviewed");
        }

        if (request.getStatus() != LeaveStatus.APPROVED &&
                request.getStatus() != LeaveStatus.REJECTED) {
            throw new RuntimeException("Status must be APPROVED or REJECTED");
        }

        if (request.getStatus() == LeaveStatus.REJECTED &&
                (request.getRejectionReason() == null || request.getRejectionReason().isBlank())) {
            throw new RuntimeException("Rejection reason is required");
        }

        leaveRequest.setStatus(request.getStatus());
        leaveRequest.setReviewedBy(reviewer);

        if (request.getStatus() == LeaveStatus.REJECTED) {
            leaveRequest.setRejectionReason(request.getRejectionReason());
        } else {
            leaveRequest.setRejectionReason(null);
        }

        return leaveRequestRepository.save(leaveRequest);
    }



//     all leave requests for admin with optional status filter


    public List<LeaveRequest> getAllLeaveRequestsForAdmin(
            Jwt jwt,
            LeaveStatus status,
            String username
    ) {
        User admin = getCurrentUser(jwt);

        if (admin.getRole() != Role.ROLE_ADMIN) {
            throw new RuntimeException("Only admin can view all leave requests");
        }

        if (username != null && !username.trim().isEmpty() && status != null) {
            return leaveRequestRepository
                    .findByEmployeeUsernameContainingIgnoreCaseAndStatusOrderByRequestIdDesc(
                            username,
                            status
                    );
        }

        if (username != null && !username.trim().isEmpty()) {
            return leaveRequestRepository
                    .findByEmployeeUsernameContainingIgnoreCaseOrderByRequestIdDesc(username);
        }

        if (status != null) {
            return leaveRequestRepository.findByStatusOrderByRequestIdDesc(status);
        }

        return leaveRequestRepository.findAllByOrderByRequestIdDesc();
    }

//    leave statistics for admin dashboard
    public LeaveStatisticsResponse getLeaveStatisticsForAdmin(Jwt jwt) {

        long totalRequests = leaveRequestRepository.count();

        long pendingRequests = leaveRequestRepository.countByStatus(LeaveStatus.PENDING);
        long approvedRequests = leaveRequestRepository.countByStatus(LeaveStatus.APPROVED);
        long rejectedRequests = leaveRequestRepository.countByStatus(LeaveStatus.REJECTED);

        return new LeaveStatisticsResponse(
                totalRequests,
                pendingRequests,
                approvedRequests,
                rejectedRequests
        );
    }


    public LeaveStatisticsResponse getMyLeaveStatistics(Jwt jwt) {

        String email = jwt.getClaimAsString("email");

        User employee = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        long totalRequests = leaveRequestRepository.countByEmployee(employee);

        long pendingRequests =
                leaveRequestRepository.countByEmployeeAndStatus(
                        employee,
                        LeaveStatus.PENDING
                );

        long approvedRequests =
                leaveRequestRepository.countByEmployeeAndStatus(
                        employee,
                        LeaveStatus.APPROVED
                );

        long rejectedRequests =
                leaveRequestRepository.countByEmployeeAndStatus(
                        employee,
                        LeaveStatus.REJECTED
                );

        return new LeaveStatisticsResponse(
                totalRequests,
                pendingRequests,
                approvedRequests,
                rejectedRequests
        );
    }

    public List<LeaveRequest> getUpcomingApprovedColleagueLeaves(Jwt jwt) {

        String email = jwt.getClaimAsString("email");

        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return leaveRequestRepository
                .findByStatusAndStartDateGreaterThanEqualAndEmployeeNotOrderByStartDateAsc(
                        LeaveStatus.APPROVED,
                        LocalDate.now(),
                        currentUser
                );
    }

}