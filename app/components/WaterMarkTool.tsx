'use client';
import { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

export default function WatermarkTool() {
  // 状态管理
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // 水印参数
  const [type, setType] = useState<'text' | 'image'>('text');
  const [text, setText] = useState('AI Doc');
  const [opacity, setOpacity] = useState(0.3);
  const [spacing, setSpacing] = useState(150);
  const [rotate, setRotate] = useState(45)
  const [watermarkImage, setWatermarkImage] = useState<File | null>(null);

  // 文件上传处理
  const { getRootProps: getFileInputProps, getInputProps: getFileInput } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg'],
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    onDrop: acceptedFiles => {
      setFile(acceptedFiles[0]);
    },
  });

  const { getRootProps: getWatermarkInputProps, getInputProps: getWatermarkInput } = useDropzone({
    accept: { 'image/*': ['.png', '.jpg', '.jpeg'] },
    maxFiles: 1,
    onDrop: acceptedFiles => {
      setWatermarkImage(acceptedFiles[0]);
    },
  });

  // 生成预览
  const generatePreview = useCallback(async () => {
    if (!file) return;

    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      formData.append('opacity', opacity.toString());
      formData.append('spacing', spacing.toString());
      formData.append('rotate', rotate.toString())
      formData.append('preview', 'true');

      if (type === 'text') {
        formData.append('text', text);
      } else if (watermarkImage) {
        formData.append('watermarkImage', watermarkImage);
      } else {
        // 使用默认水印图片
        const defaultImg = await fetch('/mark.png').then(r => r.blob());
        formData.append('watermarkImage', new File([defaultImg], 'default.png'));
      }

      const response = await fetch('/api/watermark', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Preview failed');

      const blob = await response.blob();
      setPreviewUrl(URL.createObjectURL(blob));
    } catch (error) {
      console.error('Preview error:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [file, type, text, opacity, spacing, rotate, watermarkImage]);

  // 下载处理
  const handleDownload = async () => {
    if (!file) return;

    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      formData.append('opacity', opacity.toString());
      formData.append('spacing', spacing.toString());
      formData.append('rotate', rotate.toString());

      if (type === 'text') {
        formData.append('text', text);
      } else if (watermarkImage) {
        formData.append('watermarkImage', watermarkImage);
      }

      const response = await fetch('/api/watermark', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error(await response.text());

      // 直接获取Blob对象
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `watermarked_${file.name}`;
      a.click();

      // 释放内存
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (error) {
      console.error('Error:', error);
      alert('处理失败: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // 清理对象URL
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 控制面板 */}
        <div className="space-y-4">
          <div className="space-y-4 p-4 border rounded-lg">
            <h3 className="font-bold text-lg">文件选择</h3>
            <div {...getFileInputProps()} className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50">
              <input {...getFileInput()} />
              <p className="text-gray-500">
                {file ? file.name : '拖放PDF或图片文件'}
              </p>
            </div>
          </div>

          <div className="space-y-4 p-4 border rounded-lg">
            <h3 className="font-bold text-lg">水印设置</h3>

            <div>
              <label className="block mb-2">水印类型</label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={type === 'text'}
                    onChange={() => setType('text')}
                    className="mr-2"
                  />
                  文字水印
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={type === 'image'}
                    onChange={() => setType('image')}
                    className="mr-2"
                  />
                  图片水印
                </label>
              </div>
            </div>

            {type === 'text' ? (
              <div>
                <label className="block mb-2">水印文字</label>
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
            ) : (
              <div>
                <label className="block mb-2">水印图片</label>
                <div {...getWatermarkInputProps()} className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50">
                  <input {...getWatermarkInput()} />
                  <p className="text-gray-500">
                    {watermarkImage ? watermarkImage.name : '点击选择水印图片'}
                  </p>
                </div>
              </div>
            )}

            <div>
              <label className="block mb-2">
                透明度: {Math.round(opacity * 100)}%
              </label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={opacity}
                onChange={(e) => setOpacity(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block mb-2">
                水印间距: {spacing}px
              </label>
              <input
                type="range"
                min="50"
                max="300"
                step="10"
                value={spacing}
                onChange={(e) => setSpacing(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block mb-2">
                水印角度: {rotate}
              </label>
              <input
                type="range"
                min="0"
                max="360"
                step="10"
                value={rotate}
                onChange={(e) => setRotate(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => generatePreview()}
              disabled={!file || isProcessing}
              className={`flex-1 py-2 px-4 rounded ${!file || isProcessing
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
            >
              刷新预览
            </button>
            <button
              onClick={handleDownload}
              disabled={!file || isProcessing}
              className={`flex-1 py-2 px-4 rounded text-white ${!file || isProcessing
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'
                }`}
            >
              下载文件
            </button>
          </div>
        </div>

        {/* 预览区域 */}
        <div className="border rounded-lg p-4 h-full">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-lg">效果预览</h3>
            <span className="text-sm text-gray-500">
              {isProcessing ? '生成中...' : '实时预览'}
            </span>
          </div>

          <div className="flex justify-center items-center bg-gray-50 rounded-md min-h-[600px]">
            {previewUrl ? (
              file?.type === 'application/pdf' ? (
                <div className="relative w-full h-full">
                  <iframe
                    src={previewUrl}
                    className="w-full h-[600px] border"
                    title="PDF预览"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-10 pointer-events-none">
                    <span className="bg-white px-2 py-1 rounded text-sm">
                      PDF预览 - 下载查看完整效果
                    </span>
                  </div>
                </div>
              ) : (
                <img
                  src={previewUrl}
                  alt="预览"
                  className="max-h-[500px] max-w-full object-contain"
                />
              )
            ) : (
              <div className="text-gray-400 p-8 text-center">
                {file ? '准备生成预览...' : '请先上传文件'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}