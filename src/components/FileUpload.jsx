import React, { useRef, useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Upload, FileText, Sparkles, Palette, Type } from 'lucide-react';

function FileUpload({ onFileUpload, onTextSubmit }) {
  const [isDragging, setIsDragging] = useState(false);
  const [inputMode, setInputMode] = useState('file'); // 'file' or 'text'
  const [scriptText, setScriptText] = useState('');
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

  const handleTextSubmit = () => {
    if (!scriptText.trim()) {
      alert('Please enter your script text');
      return;
    }

    if (scriptText.length < 50) {
      alert('Script is too short. Please enter at least 50 characters.');
      return;
    }

    onTextSubmit(scriptText.trim());
  };

  return (
    <div className="space-y-8">
      {/* Mode Toggle */}
      <div className="flex justify-center gap-2 p-1 bg-gray-100 rounded-lg w-fit mx-auto">
        <Button
          variant={inputMode === 'file' ? 'default' : 'ghost'}
          onClick={() => setInputMode('file')}
          className="gap-2"
        >
          <Upload className="w-4 h-4" />
          Upload File
        </Button>
        <Button
          variant={inputMode === 'text' ? 'default' : 'ghost'}
          onClick={() => setInputMode('text')}
          className="gap-2"
        >
          <Type className="w-4 h-4" />
          Paste Script
        </Button>
      </div>

      {/* Upload Area */}
      {inputMode === 'file' ? (
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
      ) : (
        /* Text Input Area */
        <Card className="bg-white/95 backdrop-blur">
          <CardContent className="p-8 md:p-12">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                  <Type className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold">Paste Your Script</h3>
                  <p className="text-muted-foreground">
                    Copy and paste your YouTube script below
                  </p>
                </div>
              </div>

              <textarea
                value={scriptText}
                onChange={(e) => setScriptText(e.target.value)}
                placeholder="Paste your script here...

Example:
Welcome to my channel. Today we're talking about productivity.
First, let's discuss time management.
Then we'll explore effective habits.
Finally, I'll share my top tips.
"
                className="w-full min-h-[300px] p-4 border-2 rounded-lg resize-vertical font-mono text-sm focus:outline-none focus:border-primary transition-colors"
              />

              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {scriptText.length > 0 ? (
                    <>
                      {scriptText.length} characters
                      {scriptText.length < 50 && (
                        <span className="text-orange-500 ml-2">
                          (minimum 50 characters)
                        </span>
                      )}
                    </>
                  ) : (
                    'Minimum 50 characters required'
                  )}
                </p>
                <Button
                  size="lg"
                  onClick={handleTextSubmit}
                  disabled={scriptText.length < 50}
                  className="text-lg px-8"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Visuals
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white/95 backdrop-blur hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6 text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h4 className="text-xl font-semibold">1. Add Script</h4>
              <p className="text-muted-foreground">
                Upload a .docx file or paste your text directly
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
