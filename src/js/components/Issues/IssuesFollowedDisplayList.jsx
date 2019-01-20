import React, { Component } from "react";
import VoterGuideStore from "../../stores/VoterGuideStore";
import IssuesDisplayListWithOrganizationPopovers from "./IssuesDisplayListWithOrganizationPopovers";
import IssueStore from "../../stores/IssueStore";
import { renderLog } from "../../utils/logging";


// Show a voter a horizontal list of all of their issues,
//  with a dropdown under each one that has all of the organizations they can follow underneath.
export default class IssuesFollowedDisplayList extends Component {
  static propTypes = {
  };

  constructor (props) {
    super(props);
    this.state = {
      transitioning: false, // unused state field
      showModal: false, // unused state field
      issuesVoterIsFollowing: [],
      maximum_organization_display: 4, // unused state field
    };
  }

  componentDidMount () {
    this.issueStoreListener = IssueStore.addListener(this.onIssueStoreChange.bind(this));
    this.voterGuideStoreListener = VoterGuideStore.addListener(this.onVoterGuideStoreChange.bind(this));
    this.onVoterGuideStoreChange();
    this.setState({
      issuesVoterIsFollowing: IssueStore.getIssuesVoterIsFollowing(),
    });
  }

  componentWillUnmount () {
    this.issueStoreListener.remove();
    this.voterGuideStoreListener.remove();
  }

  onIssueStoreChange () {
    this.setState({
      issuesVoterIsFollowing: IssueStore.getIssuesVoterIsFollowing(),
    });
  }

  onVoterGuideStoreChange () {
    // We just want to trigger a re-render
    // this.setState({ transitioning: false });
    // console.log("onVoterGuideStoreChange");
  }

  render () {
    renderLog(__filename);

    // console.log("this.state.issuesVoterIsFollowing: ", this.state.issuesVoterIsFollowing);
    const issuesVoterIsFollowingMobile = this.state.issuesVoterIsFollowing.slice(0, 2);
    const issuesVoterIsFollowingDesktop = this.state.issuesVoterIsFollowing.slice(0, 4);
    return (
      <span className="">
        {/* We want to display the images of the issues in the list we pass in */}
        <span className="d-block d-sm-none">
          <IssuesDisplayListWithOrganizationPopovers
            issueImageSize="LARGE"
            issueListToDisplay={issuesVoterIsFollowingMobile}
            popoverBottom
          />
        </span>
        <span className="d-none d-sm-block">
          <IssuesDisplayListWithOrganizationPopovers
            issueImageSize="LARGE"
            issueListToDisplay={issuesVoterIsFollowingDesktop}
            popoverBottom
          />
        </span>
      </span>
    );
  }
}
