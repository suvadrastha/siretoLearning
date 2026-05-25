package com.leavemanagement.dto;

import com.leavemanagement.enums.LeaveStatus;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReviewLeaveRequest {

    private LeaveStatus status; // APPROVED or REJECTED

    private String rejectionReason;
}