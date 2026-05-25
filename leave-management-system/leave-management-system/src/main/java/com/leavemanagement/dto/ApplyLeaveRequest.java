package com.leavemanagement.dto;

import com.leavemanagement.enums.LeaveType;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class ApplyLeaveRequest {

    private LocalDate startDate;

    private LocalDate endDate;

    private LeaveType leaveType;

    private String reason;
}