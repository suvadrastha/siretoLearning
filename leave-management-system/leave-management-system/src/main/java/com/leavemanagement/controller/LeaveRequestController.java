package com.leavemanagement.controller;

import com.leavemanagement.dto.ApplyLeaveRequest;
import com.leavemanagement.dto.LeaveStatisticsResponse;
import com.leavemanagement.dto.ReviewLeaveRequest;
import com.leavemanagement.enums.LeaveStatus;
import com.leavemanagement.model.LeaveRequest;
import com.leavemanagement.service.LeaveRequestService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leaves")
public class LeaveRequestController {

    private final LeaveRequestService leaveRequestService;

    public LeaveRequestController(LeaveRequestService leaveRequestService) {
        this.leaveRequestService = leaveRequestService;
    }

    @PostMapping("/apply")
    public LeaveRequest applyLeave(
            @RequestBody ApplyLeaveRequest request,
            @AuthenticationPrincipal Jwt jwt
    ) {
        return leaveRequestService.applyLeave(request, jwt);
    }

    @GetMapping("/my")
    public List<LeaveRequest> getMyLeaveRequests(
            @RequestParam(required = false) LeaveStatus status,
            @AuthenticationPrincipal Jwt jwt
    ) {
        return leaveRequestService.getMyLeaveRequests(jwt, status);
    }

    @PutMapping("/admin/{requestId}/review")
    public LeaveRequest reviewLeave(
            @PathVariable Long requestId,
            @RequestBody ReviewLeaveRequest request,
            @AuthenticationPrincipal Jwt jwt
    ) {
        return leaveRequestService.reviewLeave(requestId, request, jwt);
    }


//    @GetMapping("/admin/all")
//    public List<LeaveRequest> getAllLeaveRequestsForAdmin(
//            @RequestParam(required = false) LeaveStatus status,
//            @AuthenticationPrincipal Jwt jwt
//    ) {
//        return leaveRequestService.getAllLeaveRequestsForAdmin(jwt, status);
//    }

    @GetMapping("/admin/all")
    public List<LeaveRequest> getAllLeaveRequestsForAdmin(
            @RequestParam(required = false) LeaveStatus status,
            @RequestParam(required = false) String username,
            @AuthenticationPrincipal Jwt jwt
    ) {
        return leaveRequestService.getAllLeaveRequestsForAdmin(jwt, status, username);
    }


    @GetMapping("/admin/statistics")
    public LeaveStatisticsResponse getLeaveStatisticsForAdmin(
            @AuthenticationPrincipal Jwt jwt
    ) {
        return leaveRequestService.getLeaveStatisticsForAdmin(jwt);
    }

    @GetMapping("/my/statistics")
    public LeaveStatisticsResponse getMyLeaveStatistics(
            @AuthenticationPrincipal Jwt jwt
    ) {
        return leaveRequestService.getMyLeaveStatistics(jwt);
    }


    @GetMapping("/colleagues/upcoming-approved")
    public List<LeaveRequest> getUpcomingApprovedColleagueLeaves(
            @AuthenticationPrincipal Jwt jwt
    ) {
        return leaveRequestService.getUpcomingApprovedColleagueLeaves(jwt);
    }
}