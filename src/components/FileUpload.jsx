import React, { useRef, useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Upload, FileText, Sparkles, Palette } from 'lucide-react';

function FileUpload({ onFileUpload }) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFile = (file) => {
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ];

    if (!validTypes.includes(file.type) && !file.name.endsWith('.docx') && !file.name.endsWith('.doc')) {
      alert('Please upload a .doc or .docx file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      alert('File is too large. Please upload a file smaller than 10MB');
      return;
    }

    onFileUpload(file);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-8">
      {/* Upload Area */}
      <Card
        className={`cursor-pointer transition-all duration-300 bg-white/95 backdrop-blur hover:shadow-lg hover:-translate-y-1 ${
          isDragging ? 'border-primary border-2 bg-primary/5 scale-102' : ''
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <CardContent className="p-12 md:p-16">
          <input
            ref={fileInputRef}
            type="file"
            accept=".doc,.docx"
            onChange={handleFileInput}
            className="hidden"
          />
          
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
              <Upload className="w-20 h-20 text-primary relative animate-bounce" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-2xl font-semibold">Upload Your Script</h3>
              <p className="text-muted-foreground text-lg">
                Drag & drop your .doc or .docx file here
              </p>
            </div>

            <div className="flex flex-col items-center gap-3">
              <p className="text-muted-foreground font-medium">or</p>
              <Button size="lg" className="text-lg px-8">
                Browse Files
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">
              Maximum file size: 10MB
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white/95 backdrop-blur hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6 text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h4 className="text-xl font-semibold">1. Upload Script</h4>
              <p className="text-muted-foreground">
                Upload your YouTube script as a .docx file
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/95 backdrop-blur hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6 text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h4 className="text-xl font-semibold">2. AI Processing</h4>
              <p className="text-muted-foreground">
                Our AI analyzes and creates visual prompts
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/95 backdrop-blur hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6 text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
              <Palette className="w-8 h-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h4 className="text-xl font-semibold">3. Generate Visuals</h4>
              <p className="text-muted-foreground">
                Beautiful images generated for each scene
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default FileUpload;
