import React, { useState, useEffect } from "react";
import { Card, Alert, Button } from "react-bootstrap";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { useUserInfo } from "../../contexts/UserInfoContext.jsx";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ModalHeader from "../ModalHeader/ModalHeader.jsx";
import InteractionBlock from "./InteractionBlock.jsx";
import Avatar from "../Avatar.jsx";
import ActionButton from "../ActionButton/ActionButton.jsx";
import ModalLoading from "../ModalLoading.jsx";
import InfoBlock from "./InfoBlock.jsx";
import "./Profile.css";

export default function Profile({ onClose }) {
  const { t } = useTranslation();
  const { id } = useParams();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const { currentUser, logout } = useAuth();
  const { user, getUserInfo } = useUserInfo();
  const navigate = useNavigate();
  const location = useLocation();
  const backgroundLocation = location.state?.backgroundLocation || "/";

  // вантажу інформацію з БД при монтуванні компонента
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        if (id === currentUser?.uid) return setUserProfile(user);
        const userInfo = await getUserInfo(id);
        setUserProfile(userInfo);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, user]);

  async function handleLogOut() {
    setError("");
    try {
      await logout();
      navigate("/");
    } catch (error) {
      setError(t("profile.failedToLogOut"));
    }
  }

  function handleUpdateProfileClick() {
    navigate("/update-profile", {
      state: {
        backgroundLocation,
      },
      replace: true,
    });
  }

  return (
    <ModalLoading modalLoading={loading}>
      <ModalHeader
        title={userProfile?.fullName || "Unkown"}
        onClose={onClose}
      />
      <Card.Body className="profile-modal-card-body">
        {error && <Alert variant="danger">{error}</Alert>}
        {userProfile ? (
          <>
            <div className="avatar-container text-center mb-4">
              <Avatar
                avatar={userProfile.avatar}
                style={{ border: "4px solid #ffd700" }}
              />
            </div>
            {id !== currentUser?.uid && (
              <InteractionBlock
                userProfile={userProfile}
                setUserProfile={setUserProfile}
              />
            )}
            <div className="profile-info">
              <InfoBlock
                title={`@${userProfile.userName}`}
                caption={t("profile.username")}
              />
              <InfoBlock
                title={`${userProfile.email}`}
                caption={t("profile.email")}
              />
            </div>
            {id === currentUser?.uid && (
              <>
                <ActionButton
                  label={t("profile.updateProfile")}
                  className="mt-5 mb-2"
                  onClick={handleUpdateProfileClick}
                />
                <div className="text-center">
                  <Button
                    variant="link"
                    onClick={handleLogOut}
                    style={{ color: "#659287" }}
                  >
                    {t("profile.logout")}
                  </Button>
                </div>
              </>
            )}
          </>
        ) : (
          <div>{t("profile.noUserInfo")}</div>
        )}
      </Card.Body>
    </ModalLoading>
  );
}
