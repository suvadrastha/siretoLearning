function getPanelDescription(tab: string) {
  switch (tab) {
    case "apply-leave":
      return "Apply for a new leave request.";
    case "my-leave":
      return "Review your leave history and request status.";
    case "leave-calendar":
      return "View your approved leaves on the calendar.";
    case "pending-request":
      return "Review leave requests waiting for manager action.";
    case "all-leave-request":
      return "Browse every leave request submitted by the team.";
    case "all-users":
      return "View all registered users.";
    case "team-calendar":
      return "View team leave coverage across the calendar.";
    default:
      return "Overview of leave activity and quick status.";
  }
}

export default getPanelDescription;
