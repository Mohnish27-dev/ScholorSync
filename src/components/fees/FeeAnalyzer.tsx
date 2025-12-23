'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Upload,
  Receipt,
  AlertTriangle,
  CheckCircle,
  Loader2,
  IndianRupee,
  TrendingUp,
  FileText,
  Sparkles,
} from 'lucide-react';
import type { FeeAnalysisResult, FeeAnomaly } from '@/types';

interface FeeAnalyzerProps {
  onAnalyze: (receiptImage: File) => Promise<FeeAnalysisResult>;
  collegeName: string;
  branch: string;
}

export function FeeAnalyzer({ onAnalyze, collegeName, branch }: FeeAnalyzerProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<FeeAnalysisResult | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    setResult(null);

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  }, []);

  const handleAnalyze = async () => {
    if (!uploadedFile) return;

    setIsAnalyzing(true);
    try {
      const analysisResult = await onAnalyze(uploadedFile);
      setResult(analysisResult);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setUploadedFile(null);
    setPreviewUrl(null);
    setResult(null);
  };

  const getAnomalySeverity = (anomaly: FeeAnomaly): 'low' | 'medium' | 'high' => {
    const percentage = (anomaly.difference / anomaly.expectedAmount) * 100;
    if (percentage > 50) return 'high';
    if (percentage > 20) return 'medium';
    return 'low';
  };

  const getSeverityColor = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'high':
        return 'text-red-600 bg-red-50';
      case 'medium':
        return 'text-orange-600 bg-orange-50';
      case 'low':
        return 'text-yellow-600 bg-yellow-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="bg-gradient-to-r from-orange-500/10 to-red-500/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Fee Anomaly Detector
          </CardTitle>
          <CardDescription>
            Upload your fee receipt and our AI will compare it with the official fee structure to
            detect any discrepancies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">College:</span>
              <Badge variant="secondary">{collegeName || 'Not set'}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Branch:</span>
              <Badge variant="secondary">{branch || 'Not set'}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Upload Fee Receipt</CardTitle>
            <CardDescription>
              Upload an image or PDF of your fee receipt
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!uploadedFile ? (
              <label
                htmlFor="fee-receipt"
                className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
              >
                <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                <span className="text-lg font-medium">Drop your receipt here</span>
                <span className="text-sm text-muted-foreground mt-1">
                  or click to browse
                </span>
                <span className="text-xs text-muted-foreground mt-4">
                  Supports: JPG, PNG, PDF (max 10MB)
                </span>
                <input
                  id="fee-receipt"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            ) : (
              <div className="space-y-4">
                {previewUrl && (
                  <div className="relative rounded-lg overflow-hidden border">
                    {uploadedFile.type === 'application/pdf' ? (
                      <div className="flex items-center justify-center h-48 bg-muted">
                        <FileText className="h-16 w-16 text-muted-foreground" />
                        <span className="ml-2 text-muted-foreground">PDF Document</span>
                      </div>
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={previewUrl}
                        alt="Fee Receipt"
                        className="w-full h-48 object-contain bg-muted"
                      />
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4" />
                    <span className="truncate max-w-[200px]">{uploadedFile.name}</span>
                    <Badge variant="outline">
                      {(uploadedFile.size / 1024).toFixed(1)} KB
                    </Badge>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleReset}>
                    Change
                  </Button>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Analyzing Receipt...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Analyze Fee Receipt
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Analysis Results</CardTitle>
            <CardDescription>
              Comparison with official fee structure
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <div className="text-center">
                  <p className="font-medium">Analyzing your receipt...</p>
                  <p className="text-sm text-muted-foreground">
                    Our AI is comparing your fees with official rates
                  </p>
                </div>
                <Progress value={66} className="w-48" />
              </div>
            ) : result ? (
              <div className="space-y-6">
                {/* Summary */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-muted">
                    <p className="text-sm text-muted-foreground">Receipt Total</p>
                    <p className="text-2xl font-bold flex items-center">
                      <IndianRupee className="h-5 w-5" />
                      {result.receiptTotal.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted">
                    <p className="text-sm text-muted-foreground">Expected Total</p>
                    <p className="text-2xl font-bold flex items-center">
                      <IndianRupee className="h-5 w-5" />
                      {result.expectedTotal.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Overcharge Alert */}
                {result.overchargeAmount > 0 ? (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Potential Overcharge Detected!</AlertTitle>
                    <AlertDescription className="flex items-center gap-2">
                      You may have been overcharged by
                      <span className="font-bold text-lg">
                        ₹{result.overchargeAmount.toLocaleString()}
                      </span>
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-800">All Clear!</AlertTitle>
                    <AlertDescription className="text-green-700">
                      Your fee receipt matches the official fee structure
                    </AlertDescription>
                  </Alert>
                )}

                {/* Anomalies List */}
                {result.anomalies.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Detected Discrepancies
                    </h4>
                    <div className="space-y-2">
                      {result.anomalies.map((anomaly, idx) => {
                        const severity = getAnomalySeverity(anomaly);
                        return (
                          <div
                            key={idx}
                            className={`p-3 rounded-lg ${getSeverityColor(severity)}`}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">{anomaly.category}</p>
                                <p className="text-sm opacity-80">{anomaly.explanation}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold">
                                  +₹{anomaly.difference.toLocaleString()}
                                </p>
                                <p className="text-xs opacity-80">
                                  Expected: ₹{anomaly.expectedAmount.toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <Separator />

                {/* Recommendation */}
                <div className="p-4 rounded-lg bg-blue-50">
                  <h4 className="font-medium text-blue-800 mb-2">Recommendation</h4>
                  <p className="text-sm text-blue-700">{result.recommendation}</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <Receipt className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">
                  Upload a fee receipt to see the analysis
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
