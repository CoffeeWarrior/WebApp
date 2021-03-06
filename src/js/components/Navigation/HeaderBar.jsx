import React, { Component } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Button from "@material-ui/core/Button";
import Badge from "@material-ui/core/Badge";
import { withStyles } from "@material-ui/core/styles";
import BallotStore from "../../stores/BallotStore";
import { cordovaDot, historyPush, isWebApp } from "../../utils/cordovaUtils";
import cookies from "../../utils/cookies";
import FriendStore from "../../stores/FriendStore";
import HeaderBarProfilePopUp from "./HeaderBarProfilePopUp";
import HeaderBarLogo from "./HeaderBarLogo";
import { renderLog } from "../../utils/logging";
import OrganizationActions from "../../actions/OrganizationActions";
import VoterGuideActions from "../../actions/VoterGuideActions";
import VoterSessionActions from "../../actions/VoterSessionActions";
import { stringContains } from "../../utils/textFormat";

const styles = theme => ({
  headerBadge: {
    right: "-25px",
    top: "-2px",
  },
  padding: {
    padding: `0 ${theme.spacing.unit * 2}px`,
  },
});

class HeaderBar extends Component {
  static propTypes = {
    location: PropTypes.object,
    voter: PropTypes.object,
    pathname: PropTypes.string,
    classes: PropTypes.object,
  };

  static ballot (active) {
    return (
      <Link to="/ballot" className={`header-nav__item${active ? " active-icon" : ""}`}>
        <img className="header-nav__icon--ballot"
             src={cordovaDot("/img/global/svg-icons/nav/ballot-icon-24.svg")}
             color="#ffffff"
             alt="Ballot"
        />
        <span className="header-nav__label">
          Ballot
        </span>
      </Link>
    );
  }

  static goToGetStarted () {
    const getStartedNow = "/ballot";
    historyPush(getStartedNow);
  }

  constructor (props) {
    super(props);
    this.hideProfilePopUp = this.hideProfilePopUp.bind(this);
    this.signOutAndHideProfilePopUp = this.signOutAndHideProfilePopUp.bind(this);
    this.toggleProfilePopUp = this.toggleProfilePopUp.bind(this);
    this.transitionToYourVoterGuide = this.transitionToYourVoterGuide.bind(this);
    this.state = {
      aboutMenuOpen: false,
      componentDidMountFinished: false,
      profilePopUpOpen: false,
      friendInvitationsSentToMe: FriendStore.friendInvitationsSentToMe(),
    };
  }

  componentDidMount () {
    this.ballotStoreListener = BallotStore.addListener(this.onBallotStoreChange.bind(this));
    this.friendStoreListener = FriendStore.addListener(this.onFriendStoreChange.bind(this));
    // this.onBallotStoreChange();

    // this.props.location &&
    const weVoteBrandingOffFromUrl = this.props.location.query ? this.props.location.query.we_vote_branding_off : 0;
    const weVoteBrandingOffFromCookie = cookies.getItem("we_vote_branding_off");
    this.setState({
      componentDidMountFinished: true,
      we_vote_branding_off: weVoteBrandingOffFromUrl || weVoteBrandingOffFromCookie,
    });
  }

  shouldComponentUpdate (nextProps, nextState) {
    // This lifecycle method tells the component to NOT render if componentWillReceiveProps didn't see any changes
    if (this.state.componentDidMountFinished === false) {
      // console.log("shouldComponentUpdate: componentDidMountFinished === false");
      return true;
    }
    if (this.state.profilePopUpOpen === true || nextState.profilePopUpOpen === true) {
      // console.log("shouldComponentUpdate: this.state.profilePopUpOpen", this.state.profilePopUpOpen, ", nextState.profilePopUpOpen", nextState.profilePopUpOpen);
      return true;
    }
    if (this.state.aboutMenuOpen === true || nextState.aboutMenuOpen === true) {
      // console.log("shouldComponentUpdate: this.state.aboutMenuOpen", this.state.aboutMenuOpen, ", nextState.aboutMenuOpen", nextState.aboutMenuOpen);
      return true;
    }
    const currentPathnameExists = this.props.location && this.props.location.pathname;
    const nextPathnameExists = nextProps.location && nextProps.location.pathname;
    // One exists, and the other doesn't
    if ((currentPathnameExists && !nextPathnameExists) || (!currentPathnameExists && nextPathnameExists)) {
      // console.log("shouldComponentUpdate: PathnameExistsDifference");
      return true;
    }
    if (currentPathnameExists && nextPathnameExists && this.props.location.pathname !== nextProps.location.pathname) {
      // console.log("shouldComponentUpdate: this.props.location.pathname", this.props.location.pathname, ", nextProps.location.pathname", nextProps.location.pathname);
      return true;
    }
    const thisVoterExists = this.props.voter !== undefined;
    const nextVoterExists = nextProps.voter !== undefined;
    if (nextVoterExists && !thisVoterExists) {
      // console.log("shouldComponentUpdate: thisVoterExists", thisVoterExists, ", nextVoterExists", nextVoterExists);
      return true;
    }
    if (thisVoterExists && nextVoterExists && this.props.voter.signed_in_twitter !== nextProps.voter.signed_in_twitter) {
      // console.log("shouldComponentUpdate: this.props.voter.signed_in_twitter", this.props.voter.signed_in_twitter, ", nextProps.voter.signed_in_twitter", nextProps.voter.signed_in_twitter);
      return true;
    }
    if (thisVoterExists && nextVoterExists && this.props.voter.signed_in_facebook !== nextProps.voter.signed_in_facebook) {
      // console.log("shouldComponentUpdate: this.props.voter.signed_in_facebook", this.props.voter.signed_in_facebook, ", nextProps.voter.signed_in_facebook", nextProps.voter.signed_in_facebook);
      return true;
    }
    if (thisVoterExists && nextVoterExists && this.props.voter.signed_in_with_email !== nextProps.voter.signed_in_with_email) {
      // console.log("shouldComponentUpdate: this.props.voter.signed_in_with_email", this.props.voter.signed_in_with_email, ", nextProps.voter.signed_in_with_email", nextProps.voter.signed_in_with_email);
      return true;
    }
    return false;
  }

  componentWillUnmount () {
    this.ballotStoreListener.remove();
    this.friendStoreListener.remove();
  }

  onBallotStoreChange () {
    // this.setState({ bookmarks: BallotStore.bookmarks });
  }

  onFriendStoreChange () {
    this.setState({
      friendInvitationsSentToMe: FriendStore.friendInvitationsSentToMe(),
    });
  }

  getSelectedTab = () => {
    const { pathname } = this.props;
    if (stringContains('/ballot', pathname)) return 0;
    if (stringContains('/more/network/friends', pathname)) return 2;
    if (stringContains('/more/network', pathname)) return 1;
    return false;
  }

  toggleProfilePopUp () {
    const { profilePopUpOpen } = this.state;
    this.setState({ profilePopUpOpen: !profilePopUpOpen });
  }

  hideProfilePopUp () {
    this.setState({ profilePopUpOpen: false });
  }

  signOutAndHideProfilePopUp () {
    VoterSessionActions.voterSignOut();
    this.setState({ profilePopUpOpen: false });
  }

  transitionToYourVoterGuide () {
    // Positions for this organization, for this voter/election
    OrganizationActions.positionListForOpinionMaker(this.props.voter.linked_organization_we_vote_id, true);

    // Positions for this organization, NOT including for this voter / election
    OrganizationActions.positionListForOpinionMaker(this.props.voter.linked_organization_we_vote_id, false, true);
    OrganizationActions.organizationsFollowedRetrieve();
    VoterGuideActions.voterGuideFollowersRetrieve(this.props.voter.linked_organization_we_vote_id);
    VoterGuideActions.voterGuidesFollowedByOrganizationRetrieve(this.props.voter.linked_organization_we_vote_id);
    this.setState({ profilePopUpOpen: false });
  }

  render () {
    renderLog(__filename);
    const { voter, classes } = this.props;
    const voterPhotoUrlMedium = voter.voter_photo_url_medium;
    const numberOfIncomingFriendRequests = this.state.friendInvitationsSentToMe.length || 0;
    const voterIsSignedIn = this.props.voter && this.props.voter.is_signed_in;
    const showFullNavigation = cookies.getItem("show_full_navigation") || voterIsSignedIn;
    const weVoteBrandingOff = this.state.we_vote_branding_off;
    return (
      <AppBar position="relative" color="default" className={isWebApp() ? "page-header" : "page-header page-header__cordova"}>
        <Toolbar className="header-toolbar" disableGutters>
          {!weVoteBrandingOff && isWebApp() && <HeaderBarLogo showFullNavigation={!!showFullNavigation} isBeta />}
          <div className="header-nav">
            <Tabs
              value={this.getSelectedTab()}
              indicatorColor="primary"
            >
              {showFullNavigation && isWebApp() && <Link to="/ballot" className="header-link u-show-desktop"><Tab label="Ballot" /></Link>}
              {showFullNavigation && isWebApp() && <Link to="/more/network/issues" className="header-link u-show-desktop"><Tab label="My Values" /></Link>}
              {showFullNavigation && isWebApp() && <Link to="/more/network/friends" className="header-link u-show-desktop"><Tab label={<Badge classes={{ badge: classes.headerBadge }} badgeContent={numberOfIncomingFriendRequests} color="primary" max={9} invisible={!numberOfIncomingFriendRequests}>My Friends</Badge>} /></Link>}
              {/* showFullNavigation && isWebApp() && <Tab className="u-show-desktop" label="Vote" /> */}
            </Tabs>

            { !showFullNavigation && isWebApp() && (
              <Button
                className="header-sign-in"
                variant="text"
                color="primary"
                href="/settings/account"
              >
                Sign In
              </Button>
            )}
          </div>

          {/* (showFullNavigation || isCordova()) && <SearchAllBox /> */}

          {
            showFullNavigation && isWebApp() && (
            <div className="header-nav__avatar-wrapper u-cursor--pointer u-flex-none" onClick={this.toggleProfilePopUp}>
              {voterPhotoUrlMedium ? (
                <div id="js-header-avatar" className="header-nav__avatar-container">
                  <img
                className="header-nav__avatar"
                src={voterPhotoUrlMedium}
                height={34}
                width={34}
                alt="generic avatar"
                  />
                </div>
              ) : (
                <Button
                  className="header-sign-in"
                  variant="text"
                  color="primary"
                  href="/settings/account"
                >
                  Sign In
                </Button>
              )
          }
              {/* Was AccountMenu */}
              {this.state.profilePopUpOpen && voter.is_signed_in && (
              <HeaderBarProfilePopUp
                {...this.props}
                onClick={this.toggleProfilePopUp}
                profilePopUpOpen={this.state.profilePopUpOpen}
                weVoteBrandingOff={this.state.we_vote_branding_off}
                toggleProfilePopUp={this.toggleProfilePopUp}
                hideProfilePopUp={this.hideProfilePopUp}
                transitionToYourVoterGuide={this.transitionToYourVoterGuide}
                signOutAndHideProfilePopUp={this.signOutAndHideProfilePopUp}
              />
              )}
            </div>
            )}
        </Toolbar>
      </AppBar>
    );
  }
}

export default withStyles(styles)(HeaderBar);
