"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FiUpload, FiImage, FiFile, FiVideo, FiX } from "react-icons/fi";
import { MdAudiotrack } from "react-icons/md";

const FileUpload = ({ onFilesSelected, onClose }) => {
  const [files, setFiles] = useState([]);

  const onDrop = useCallback((acceptedFiles) => {
    const newFiles = acceptedFiles.map((file) => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      preview: file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : null,
    }));

    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
      "video/*": [".mp4", ".mov", ".avi"],
      "audio/*": [".mp3", ".wav", ".m4a"],
      "application/pdf": [".pdf"],
      "text/plain": [".txt"],
      "application/msword": [".doc", ".docx"],
      "application/vnd.ms-excel": [".xls", ".xlsx"],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const removeFile = (id) => {
    setFiles((prev) => {
      const fileToRemove = prev.find((f) => f.id === id);
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter((f) => f.id !== id);
    });
  };

  const handleSend = () => {
    if (files.length > 0) {
      onFilesSelected(files);
      files.forEach((f) => {
        if (f.preview) URL.revokeObjectURL(f.preview);
      });
      setFiles([]);
    }
  };

  const getFileIcon = (type) => {
    if (type.startsWith("image/")) return <FiImage className="w-5 h-5" />;
    if (type.startsWith("video/")) return <FiVideo className="w-5 h-5" />;
    if (type.startsWith("audio/")) return <MdAudiotrack className="w-5 h-5" />;
    if (type.includes("pdf")) return <FiFile className="w-5 h-5" />;
    return <FiFile className="w-5 h-5" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="bg-white rounded-xl shadow-xl border w-96 max-h-96 overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b">
        <h3 className="font-semibold text-gray-800">Upload Files</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-full"
        >
          <FiX className="w-5 h-5" />
        </button>
      </div>

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`m-4 p-6 border-2 border-dashed rounded-xl text-center cursor-pointer transition-colors ${
          isDragActive
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
        }`}
      >
        <input {...getInputProps()} />
        <FiUpload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600 mb-1">
          {isDragActive ? "Drop files here..." : "Drag & drop files here"}
        </p>
        <p className="text-sm text-gray-500">or click to select files</p>
        <p className="text-xs text-gray-400 mt-2">
          Supports images, videos, audio, PDFs (max 10MB)
        </p>
      </div>

      {/* Selected Files */}
      {files.length > 0 && (
        <div className="px-4 pb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Selected Files ({files.length})
          </h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  {file.preview ? (
                    <img
                      src={file.preview}
                      alt={file.name}
                      className="w-10 h-10 object-cover rounded"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center">
                      {getFileIcon(file.type)}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-800 truncate max-w-xs">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(file.id)}
                  className="p-1 hover:bg-red-100 rounded-full text-red-500"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 mt-4">
            <button
              onClick={() => {
                files.forEach((f) => {
                  if (f.preview) URL.revokeObjectURL(f.preview);
                });
                setFiles([]);
              }}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Clear All
            </button>
            <button
              onClick={handleSend}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Send {files.length} File{files.length > 1 ? "s" : ""}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
