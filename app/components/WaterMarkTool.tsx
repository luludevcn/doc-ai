'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useDebounce } from 'use-debounce';

export default function WatermarkTool() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState('Confidential');
  const [opacity, setOpacity] = useState(0.5);
  const [angle, setAngle] = useState(-45);
  const [size, setSize] = useState(32);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isHighQuality, setIsHighQuality] = useState(false);
  const [debouncedOptions] = useDebounce({ text, opacity, angle, size }, 300);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const downloadRef = useRef<HTMLAnchorElement>(null);

  // 文件上传处理
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg'],
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    onDrop: acceptedFiles => {
      setFile(acceptedFiles[0]);
      setIsHighQuality(false);
    },
  });

  // 生成缩略图预览
  const generateThumbnailPreview = useCallback(async () => {
    if (!file || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 图片文件预览
    if (file.type.startsWith('image/')) {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      await new Promise(resolve => (img.onload = resolve));

      // 调整画布尺寸
      const ratio = Math.min(400 / img.width, 300 / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;

      // 绘制图像
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // 添加水印文本
      ctx.fillStyle = `rgba(128, 128, 128, ${opacity})`;
      ctx.font = `${size}px Arial`;
      ctx.textAlign = 'center';
      ctx.save();
      ctx.translate(canvas.width/2, canvas.height/2);
      ctx.rotate((angle * Math.PI) / 180);
      ctx.fillText(text, 0, 0);
      ctx.restore();

      setPreviewUrl(canvas.toDataURL());
    }
    // PDF文件预览（显示第一页缩略图）
    else if (file.type === 'application/pdf') {
      canvas.width = 300;
      canvas.height = 400;
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = `rgba(128, 128, 128, ${opacity})`;
      ctx.font = `${size}px Arial`;
      ctx.textAlign = 'center';
      ctx.save();
      ctx.translate(canvas.width/2, canvas.height/2);
      ctx.rotate((angle * Math.PI) / 180);
      ctx.fillText(text, 0, 0);
      ctx.restore();
      ctx.strokeStyle = '#ccc';
      ctx.strokeRect(10, 10, canvas.width-20, canvas.height-20);
      ctx.fillStyle = '#666';
      ctx.fillText('PDF Preview', canvas.width/2, 30);

      setPreviewUrl(canvas.toDataURL());
    }
  }, [file, text, opacity, angle, size]);

  // 生成高质量预览
  const generateHighQualityPreview = async () => {
    if (!file) return;
    
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('text', text);
      formData.append('opacity', opacity.toString());
      formData.append('angle', angle.toString());
      formData.append('size', size.toString());
      formData.append('preview', 'true');

      const endpoint = file.type === 'application/pdf' 
        ? '/api/pdf' 
        : '/api/image';

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Preview generation failed');

      const blob = await response.blob();
      setPreviewUrl(URL.createObjectURL(blob));
      setIsHighQuality(true);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // 参数变化时更新预览
  useEffect(() => {
    if (file && !isHighQuality) {
      generateThumbnailPreview();
    }
  }, [file, debouncedOptions, generateThumbnailPreview, isHighQuality]);

  // 下载处理
  const handleDownload = async () => {
    if (!file) return;
    
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('text', text);
      formData.append('opacity', opacity.toString());
      formData.append('angle', angle.toString());
      formData.append('size', size.toString());

      const endpoint = file.type === 'application/pdf' 
        ? '/api/pdf' 
        : '/api/image';

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Processing failed');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      if (downloadRef.current) {
        downloadRef.current.href = url;
        downloadRef.current.download = `watermarked_${file.name}`;
        downloadRef.current.click();
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 p-4 max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 参数控制区 */}
        <div className="space-y-4">
          <div {...getRootProps()} className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors">
            <input {...getInputProps()} />
            <p className="text-gray-500">
              {file ? file.name : '拖放文件到此处或点击选择'}
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block mb-1 font-medium">水印文字</label>
              <input
                type="text"
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  setIsHighQuality(false);
                }}
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">
                透明度: {Math.round(opacity * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={opacity}
                onChange={(e) => {
                  setOpacity(parseFloat(e.target.value));
                  setIsHighQuality(false);
                }}
                className="w-full"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">
                旋转角度: {angle}°
              </label>
              <input
                type="range"
                min="-180"
                max="180"
                value={angle}
                onChange={(e) => {
                  setAngle(parseInt(e.target.value));
                  setIsHighQuality(false);
                }}
                className="w-full"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">
                字体大小: {size}px
              </label>
              <input
                type="range"
                min="10"
                max="72"
                value={size}
                onChange={(e) => {
                  setSize(parseInt(e.target.value));
                  setIsHighQuality(false);
                }}
                className="w-full"
              />
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                onClick={generateHighQualityPreview}
                disabled={!file || isProcessing}
                className={`flex-1 py-2 px-4 rounded ${
                  !file || isProcessing
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isHighQuality ? '高质量预览已加载' : '加载高质量预览'}
              </button>
              
              <button
                onClick={handleDownload}
                disabled={!file || isProcessing}
                className={`flex-1 py-2 px-4 rounded text-white ${
                  !file || isProcessing
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {isProcessing ? '处理中...' : '下载文件'}
              </button>
            </div>
          </div>
        </div>

        {/* 预览区 */}
        <div className="border rounded-lg p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold">实时预览</h3>
            <span className="text-sm text-gray-500">
              {isHighQuality ? '高质量模式' : '快速预览模式'}
            </span>
          </div>
          
          <div className="flex justify-center items-center bg-gray-50 rounded-md min-h-[300px]">
            {previewUrl ? (
              file?.type === 'application/pdf' ? (
                <div className="relative">
                  <img 
                    src={previewUrl} 
                    alt="PDF预览" 
                    className="max-h-[400px] border"
                  />
                  {!isHighQuality && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 text-white">
                      <span>PDF预览 - 点击"高质量预览"查看细节</span>
                    </div>
                  )}
                </div>
              ) : (
                <img
                  src={previewUrl}
                  alt="图片预览"
                  className="max-h-[400px] max-w-full object-contain"
                />
              )
            ) : (
              <div className="text-gray-400 p-8 text-center">
                {file ? '生成预览中...' : '上传文件后显示预览'}
              </div>
            )}
          </div>
          
          <canvas ref={canvasRef} className="hidden" />
          
          <p className="text-xs text-gray-500 mt-3">
            {isHighQuality 
              ? '当前显示服务器生成的高质量预览' 
              : '实时预览为客户端生成，可能与最终结果略有差异'}
          </p>
        </div>
      </div>

      <a ref={downloadRef} className="hidden" />
    </div>
  );
}