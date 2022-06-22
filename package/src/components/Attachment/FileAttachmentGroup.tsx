import React, { useEffect, useState } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import type { Attachment } from 'stream-chat';

import { Attachment as AttachmentDefault } from './Attachment';

import {
  MessageContextValue,
  useMessageContext,
} from '../../contexts/messageContext/MessageContext';
import {
  MessagesContextValue,
  useMessagesContext,
} from '../../contexts/messagesContext/MessagesContext';
import { useTheme } from '../../contexts/themeContext/ThemeContext';

import type { DefaultStreamChatGenerics } from '../../types/types';
import { AudioAttachmentUploadPreview } from '../MessageInput/AudioAttachmentUploadPreview';

const styles = StyleSheet.create({
  container: {
    padding: 4,
  },
});

export type FileAttachmentGroupPropsWithContext<
  StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics,
> = Pick<MessageContextValue<StreamChatGenerics>, 'files'> &
  Pick<MessagesContextValue<StreamChatGenerics>, 'Attachment'> & {
    /**
     * The unique id for the message with file attachments
     */
    messageId: string;
    styles?: Partial<{
      attachmentContainer: StyleProp<ViewStyle>;
      container: StyleProp<ViewStyle>;
    }>;
  };

type FilesToDisplayType<
  StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics,
> = Attachment<StreamChatGenerics> & {
  duration: number;
  paused: boolean;
  progress: number;
};

const FileAttachmentGroupWithContext = <
  StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics,
>(
  props: FileAttachmentGroupPropsWithContext<StreamChatGenerics>,
) => {
  const { Attachment, files, messageId, styles: stylesProp = {} } = props;
  const [filesToDisplay, setFilesToDisplay] = useState<FilesToDisplayType[]>([]);

  useEffect(() => {
    setFilesToDisplay(files.map((file) => ({ ...file, duration: 0, paused: true, progress: 0 })));
  }, [files]);

  // Handler triggered when an audio is loaded in the message input. The initial state is defined for the audio here and the duration is set.
  const onLoad = (index: string, duration: number) => {
    setFilesToDisplay((prevFileUploads) =>
      prevFileUploads.map((fileUpload, id) => ({
        ...fileUpload,
        duration: id.toString() === index ? duration : fileUpload.duration,
      })),
    );
  };

  // The handler which is triggered when the audio progresses/ the thumb is dragged in the progress control. The progressed duration is set here.
  const onProgress = (index: string, currentTime?: number, hasEnd?: boolean) => {
    setFilesToDisplay((prevFileUploads) =>
      prevFileUploads.map((fileUpload, id) => ({
        ...fileUpload,
        progress:
          id.toString() === index
            ? hasEnd
              ? 1
              : currentTime
              ? currentTime / (fileUpload.duration as number)
              : 0
            : fileUpload.progress,
      })),
    );
  };

  // The handler which controls or sets the paused/played state of the audio.
  const onPlayPause = (index: string, status?: boolean) => {
    if (status === false) {
      // If the status is false we set the audio with the index as playing and the others as paused.
      setFilesToDisplay((prevFileUploads) =>
        prevFileUploads.map((fileUpload, id) => ({
          ...fileUpload,
          paused: id.toString() === index ? false : true,
        })),
      );
    } else {
      // If the status is true we simply set all the audio's paused state as true.
      setFilesToDisplay((prevFileUploads) =>
        prevFileUploads.map((fileUpload) => ({
          ...fileUpload,
          paused: true,
        })),
      );
    }
  };

  const {
    theme: {
      messageSimple: {
        fileAttachmentGroup: { container },
      },
    },
  } = useTheme();

  return (
    <View style={[styles.container, container, stylesProp.container]}>
      {filesToDisplay.map((file, index) => (
        <View
          key={`${messageId}-${index}`}
          style={[
            { paddingBottom: index !== files.length - 1 ? 4 : 0 },
            stylesProp.attachmentContainer,
          ]}
        >
          {file.type === 'audio' ? (
            <AudioAttachmentUploadPreview
              duration={file.duration}
              fileId={index.toString()}
              fileName={file.title as string}
              fileUrl={file.asset_url}
              index={index}
              onLoad={onLoad}
              onPlayPause={onPlayPause}
              onProgress={onProgress}
              paused={file.paused}
              progress={file.progress}
            />
          ) : (
            <Attachment attachment={file} />
          )}
        </View>
      ))}
    </View>
  );
};

const areEqual = <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>(
  prevProps: FileAttachmentGroupPropsWithContext<StreamChatGenerics>,
  nextProps: FileAttachmentGroupPropsWithContext<StreamChatGenerics>,
) => {
  const { files: prevFiles } = prevProps;
  const { files: nextFiles } = nextProps;

  return prevFiles.length === nextFiles.length;
};

const MemoizedFileAttachmentGroup = React.memo(
  FileAttachmentGroupWithContext,
  areEqual,
) as typeof FileAttachmentGroupWithContext;

export type FileAttachmentGroupProps<
  StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics,
> = Partial<Omit<FileAttachmentGroupPropsWithContext<StreamChatGenerics>, 'messageId'>> &
  Pick<FileAttachmentGroupPropsWithContext<StreamChatGenerics>, 'messageId'>;

export const FileAttachmentGroup = <
  StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics,
>(
  props: FileAttachmentGroupProps<StreamChatGenerics>,
) => {
  const { files: propFiles, messageId } = props;

  const { files: contextFiles } = useMessageContext<StreamChatGenerics>();

  const { Attachment = AttachmentDefault } = useMessagesContext<StreamChatGenerics>();

  const files = propFiles || contextFiles;

  if (!files.length) return null;

  return (
    <MemoizedFileAttachmentGroup
      {...{
        Attachment,
        files,
        messageId,
      }}
    />
  );
};

FileAttachmentGroup.displayName = 'FileAttachmentGroup{messageSimple{fileAttachmentGroup}}';
