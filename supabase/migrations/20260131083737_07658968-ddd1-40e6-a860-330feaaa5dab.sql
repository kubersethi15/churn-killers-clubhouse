-- Create feedback table for CS Analyzer private preview
CREATE TABLE public.cs_analyzer_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  analysis_id UUID REFERENCES public.analyses(id) ON DELETE SET NULL,
  ease_of_use INTEGER CHECK (ease_of_use >= 1 AND ease_of_use <= 5),
  analysis_accuracy INTEGER CHECK (analysis_accuracy >= 1 AND analysis_accuracy <= 5),
  would_recommend INTEGER CHECK (would_recommend >= 1 AND would_recommend <= 5),
  most_useful_feature TEXT,
  improvement_suggestions TEXT,
  bugs_encountered TEXT,
  additional_comments TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cs_analyzer_feedback ENABLE ROW LEVEL SECURITY;

-- Users can submit feedback
CREATE POLICY "Users can submit feedback"
ON public.cs_analyzer_feedback
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can view their own feedback
CREATE POLICY "Users can view their own feedback"
ON public.cs_analyzer_feedback
FOR SELECT
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_feedback_user_id ON public.cs_analyzer_feedback(user_id);
CREATE INDEX idx_feedback_created_at ON public.cs_analyzer_feedback(created_at DESC);