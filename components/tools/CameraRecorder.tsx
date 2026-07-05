"use client";

import React from "react";
import { Alert, Button, Card, Col, Form, Row, Select } from "antd";
import { useI18n } from "@/lib/i18n/context";

interface MediaItem {
  type: "image" | "video";
  value: string;
  createdAt: Date;
}

type RecordingState = "stopped" | "recording" | "paused";

export function CameraRecorder() {
  const { t } = useI18n();
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const [permissionGranted, setPermissionGranted] = React.useState(false);
  const [permissionCannotBePrompted, setPermissionCannotBePrompted] =
    React.useState(false);
  const [isSupported] = React.useState(
    typeof navigator !== "undefined" &&
      typeof navigator.mediaDevices !== "undefined",
  );

  const [cameras, setCameras] = React.useState<MediaDeviceInfo[]>([]);
  const [microphones, setMicrophones] = React.useState<MediaDeviceInfo[]>([]);
  const [currentCamera, setCurrentCamera] = React.useState<string | undefined>();
  const [currentMicrophone, setCurrentMicrophone] = React.useState<
    string | undefined
  >();

  const [stream, setStream] = React.useState<MediaStream | null>(null);
  const [isMediaStreamAvailable, setIsMediaStreamAvailable] =
    React.useState(false);

  const [medias, setMedias] = React.useState<MediaItem[]>([]);

  const [mediaRecorder, setMediaRecorder] =
    React.useState<MediaRecorder | null>(null);
  const [recordingState, setRecordingState] =
    React.useState<RecordingState>("stopped");
  const recordedChunksRef = React.useRef<Blob[]>([]);

  const isRecordingSupported =
    typeof window !== "undefined" &&
    "MediaRecorder" in window &&
    MediaRecorder.isTypeSupported("video/webm");

  const refreshDevices = React.useCallback(async () => {
    if (!navigator.mediaDevices?.enumerateDevices) return;
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoInputs = devices.filter((d) => d.kind === "videoinput");
    const audioInputs = devices.filter((d) => d.kind === "audioinput");
    setCameras(videoInputs);
    setMicrophones(audioInputs);
    if (!currentCamera && videoInputs[0]) {
      setCurrentCamera(videoInputs[0].deviceId);
    }
    if (!currentMicrophone && audioInputs[0]) {
      setCurrentMicrophone(audioInputs[0].deviceId);
    }
  }, [currentCamera, currentMicrophone]);

  const ensurePermissions = React.useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error("getUserMedia not supported");
    }
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      s.getTracks().forEach((t) => t.stop());
      setPermissionGranted(true);
      await refreshDevices();
    } catch (e) {
      setPermissionGranted(false);
      throw e;
    }
  }, [refreshDevices]);

  React.useEffect(() => {
    if (!isSupported) return;
    void refreshDevices();
  }, [isSupported, refreshDevices]);

  const stopStream = React.useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
    }
    setStream(null);
    setIsMediaStreamAvailable(false);
  }, [stream]);

  const startWebcam = React.useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) return;
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: currentCamera ? { deviceId: currentCamera } : true,
        audio: currentMicrophone ? { deviceId: currentMicrophone } : false,
      });
      setStream(s);
      setIsMediaStreamAvailable(true);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
      }
    } catch {
      // ignore
    }
  }, [currentCamera, currentMicrophone]);

  React.useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  React.useEffect(
    () => () => {
      stopStream();
    },
    [stopStream],
  );

  const requestPermissions = async () => {
    try {
      await ensurePermissions();
    } catch {
      setPermissionCannotBePrompted(true);
    }
  };

  const takeScreenshot = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const image = canvas.toDataURL("image/png");
    setMedias((prev) => [
      { type: "image", value: image, createdAt: new Date() },
      ...prev,
    ]);
  };

  const startRecording = () => {
    if (!isRecordingSupported || !stream || recordingState !== "stopped") return;
    const recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
    recordedChunksRef.current = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        recordedChunksRef.current.push(e.data);
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      recordedChunksRef.current = [];
      setMedias((prev) => [
        { type: "video", value: url, createdAt: new Date() },
        ...prev,
      ]);
    };

    recorder.start();
    setMediaRecorder(recorder);
    setRecordingState("recording");
  };

  const stopRecording = () => {
    if (!isRecordingSupported || !mediaRecorder) return;
    if (recordingState === "stopped") return;
    mediaRecorder.stop();
    setRecordingState("stopped");
  };

  const pauseRecording = () => {
    if (!isRecordingSupported || !mediaRecorder) return;
    if (recordingState !== "recording") return;
    mediaRecorder.pause();
    setRecordingState("paused");
  };

  const resumeRecording = () => {
    if (!isRecordingSupported || !mediaRecorder) return;
    if (recordingState !== "paused") return;
    mediaRecorder.resume();
    setRecordingState("recording");
  };

  const downloadMedia = (item: MediaItem) => {
    const link = document.createElement("a");
    link.href = item.value;
    link.download = `${item.type}-${item.createdAt.getTime()}.${
      item.type === "image" ? "png" : "webm"
    }`;
    link.click();
  };

  if (!isSupported) {
    return (
      <Card>
        {t("tools.camera-recorder.browserNotSupport")}
      </Card>
    );
  }

  if (!permissionGranted) {
    return (
      <Card style={{ textAlign: "center" }}>
        <div>{t("tools.camera-recorder.grantPermissionMessage")}</div>
        {permissionCannotBePrompted ? (
          <Alert
            style={{ marginTop: 16, textAlign: "left" }}
            title={t("tools.camera-recorder.grantPermissionBlocked")}
            type="warning"
          />
        ) : (
          <div style={{ marginTop: 16 }}>
            <Button type="primary" onClick={requestPermissions}>
              {t("tools.camera-recorder.buttonGrantPermission")}
            </Button>
          </div>
        )}
      </Card>
    );
  }

  return (
    <div>
      <Card>
        <Form layout="vertical">
          <Form.Item label={t("tools.camera-recorder.labelVideo")}>
            <Select
              value={currentCamera}
              onChange={(v) => setCurrentCamera(v)}
              options={cameras.map(({ deviceId, label }) => ({
                value: deviceId,
                label: label || deviceId,
              }))}
              style={{ width: "100%" }}
              placeholder={t("tools.camera-recorder.placeholderSelectCamera")}
            />
          </Form.Item>
          {microphones.length > 0 && (
            <Form.Item label={t("tools.camera-recorder.labelAudio")}>
              <Select
                value={currentMicrophone}
                onChange={(v) => setCurrentMicrophone(v)}
                options={microphones.map(({ deviceId, label }) => ({
                  value: deviceId,
                  label: label || deviceId,
                }))}
                style={{ width: "100%" }}
                placeholder={t("tools.camera-recorder.placeholderSelectMicrophone")}
              />
            </Form.Item>
          )}
        </Form>

        {!isMediaStreamAvailable ? (
          <div style={{ marginTop: 16, textAlign: "center" }}>
            <Button type="primary" onClick={startWebcam}>
              {t("tools.camera-recorder.buttonStartWebcam")}
            </Button>
          </div>
        ) : (
          <div style={{ marginTop: 16 }}>
            <div style={{ marginBottom: 8 }}>
              <video
                ref={videoRef}
                autoPlay
                controls
                playsInline
                style={{ width: "100%", maxHeight: 400 }}
              />
            </div>

            <Row align="middle" justify="space-between" gutter={8}>
              <Col>
                <Button
                  disabled={!isMediaStreamAvailable}
                  onClick={takeScreenshot}
                >
                  {t("tools.camera-recorder.buttonTakeScreenshot")}
                </Button>
              </Col>
              <Col>
                {isRecordingSupported ? (
                  <div style={{ display: "flex", gap: 8 }}>
                    {recordingState === "stopped" && (
                      <Button onClick={startRecording}>{t("tools.camera-recorder.buttonStartRecording")}</Button>
                    )}
                    {recordingState === "recording" && (
                      <Button onClick={pauseRecording}>{t("tools.camera-recorder.buttonPause")}</Button>
                    )}
                    {recordingState === "paused" && (
                      <Button onClick={resumeRecording}>{t("tools.camera-recorder.buttonResume")}</Button>
                    )}
                    {recordingState !== "stopped" && (
                      <Button danger onClick={stopRecording}>
                        {t("tools.camera-recorder.buttonStop")}
                      </Button>
                    )}
                  </div>
                ) : (
                  <div style={{ fontStyle: "italic", opacity: 0.6 }}>
                    {t("tools.camera-recorder.recordingNotSupported")}
                  </div>
                )}
              </Col>
            </Row>
          </div>
        )}
      </Card>

      <Row gutter={[8, 8]} style={{ marginTop: 16 }}>
        {medias.map((m, index) => (
          <Col xs={24} md={12} key={`${m.type}-${m.createdAt.getTime()}-${index}`}>
            <Card>
              {m.type === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={m.value}
                  alt="screenshot"
                  style={{ width: "100%", maxHeight: 300 }}
                />
              ) : (
                <video
                  src={m.value}
                  controls
                  style={{ width: "100%", maxHeight: 300 }}
                />
              )}
              <div
                style={{
                  marginTop: 8,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div style={{ fontWeight: 600 }}>
                  {m.type === "image" ? t("tools.camera-recorder.labelScreenshot") : t("tools.camera-recorder.labelVideoItem")}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Button onClick={() => downloadMedia(m)}>{t("tools.camera-recorder.buttonDownload")}</Button>
                  <Button
                    danger
                    onClick={() =>
                      setMedias((prev) => prev.filter((_, i) => i !== index))
                    }
                  >
                    {t("tools.camera-recorder.buttonDelete")}
                  </Button>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}

