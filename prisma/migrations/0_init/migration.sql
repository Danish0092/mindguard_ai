-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('student', 'counselor', 'admin');

-- CreateEnum
CREATE TYPE "MessageRole" AS ENUM ('student', 'assistant', 'counselor');

-- CreateEnum
CREATE TYPE "AgentKind" AS ENUM ('conversation', 'mood_analysis', 'memory_pattern', 'therapeutic', 'crisis_detection');

-- CreateEnum
CREATE TYPE "RiskTier" AS ENUM ('none', 'low', 'medium', 'high');

-- CreateEnum
CREATE TYPE "SeverityBand" AS ENUM ('minimal', 'mild', 'moderate', 'moderately_severe', 'severe');

-- CreateEnum
CREATE TYPE "WellnessTrend" AS ENUM ('improving', 'stable', 'declining', 'unknown');

-- CreateEnum
CREATE TYPE "CaseStatus" AS ENUM ('open', 'acknowledged', 'resolved', 'false_positive');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "role" "UserRole" NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "university" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "program" TEXT,
    "year_of_study" SMALLINT,
    "preferred_language" TEXT DEFAULT 'en',
    "emergency_contact" TEXT,
    "checkin_hour" SMALLINT,
    "is_on_call" BOOLEAN NOT NULL DEFAULT false,
    "phone" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_seen_at" TIMESTAMPTZ(6),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consents" (
    "id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "scope" TEXT NOT NULL,
    "granted" BOOLEAN NOT NULL,
    "policy_version" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "is_checkin" BOOLEAN NOT NULL DEFAULT false,
    "started_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMPTZ(6),
    "message_count" INTEGER NOT NULL DEFAULT 0,
    "summary" TEXT,
    "min_wellness" SMALLINT,
    "peak_risk" "RiskTier" NOT NULL DEFAULT 'none',

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" UUID NOT NULL,
    "conversation_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "seq" INTEGER NOT NULL,
    "role" "MessageRole" NOT NULL,
    "content" TEXT NOT NULL,
    "token_count" INTEGER,
    "embedding" vector(1536),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_outputs" (
    "id" UUID NOT NULL,
    "message_id" UUID,
    "conversation_id" UUID,
    "student_id" UUID NOT NULL,
    "agent" "AgentKind" NOT NULL,
    "wellness_score" SMALLINT,
    "sentiment" DECIMAL(4,3),
    "primary_emotion" TEXT,
    "depression_type" TEXT,
    "severity" "SeverityBand",
    "risk_tier" "RiskTier",
    "result" JSONB NOT NULL,
    "prompt_version" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "latency_ms" INTEGER,
    "total_tokens" INTEGER,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_outputs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "escalations" (
    "id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "output_id" UUID NOT NULL,
    "tier" "RiskTier" NOT NULL,
    "status" "CaseStatus" NOT NULL DEFAULT 'open',
    "summary" TEXT NOT NULL,
    "counselor_id" UUID,
    "opened_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acknowledged_at" TIMESTAMPTZ(6),
    "resolved_at" TIMESTAMPTZ(6),
    "outcome" TEXT,

    CONSTRAINT "escalations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessments" (
    "id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "conversation_id" UUID,
    "instrument" TEXT NOT NULL,
    "item_scores" SMALLINT[],
    "total_score" SMALLINT NOT NULL,
    "severity" "SeverityBand" NOT NULL,
    "safety_flag" BOOLEAN NOT NULL DEFAULT false,
    "taken_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interventions" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "modality" TEXT NOT NULL,
    "target_states" TEXT[],
    "rationale" TEXT NOT NULL,
    "script" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "interventions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "intervention_logs" (
    "id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "conversation_id" UUID NOT NULL,
    "intervention_id" INTEGER NOT NULL,
    "accepted" BOOLEAN,
    "helpfulness" SMALLINT,
    "wellness_before" SMALLINT,
    "wellness_after" SMALLINT,
    "delivered_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "intervention_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_memory" (
    "student_id" UUID NOT NULL,
    "trend" "WellnessTrend" NOT NULL DEFAULT 'unknown',
    "current_wellness" DECIMAL(3,1),
    "baseline_wellness" DECIMAL(3,1),
    "consecutive_decline_days" SMALLINT NOT NULL DEFAULT 0,
    "triggers" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "effective_interventions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "ineffective_interventions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "last_phq9_score" SMALLINT,
    "last_phq9_at" TIMESTAMPTZ(6),
    "context_card" TEXT,
    "pattern_findings" JSONB NOT NULL DEFAULT '{}',
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "student_memory_pkey" PRIMARY KEY ("student_id")
);

-- CreateTable
CREATE TABLE "knowledge_base" (
    "id" SERIAL NOT NULL,
    "kind" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "embedding" vector(1536),
    "version" TEXT NOT NULL DEFAULT 'v1',
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "knowledge_base_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prompt_versions" (
    "id" SERIAL NOT NULL,
    "agent" "AgentKind" NOT NULL,
    "version" TEXT NOT NULL,
    "template" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "temperature" DECIMAL(2,1) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prompt_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL,
    "escalation_id" UUID,
    "recipient_id" UUID NOT NULL,
    "channel" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'queued',
    "provider_id" TEXT,
    "error" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "id" BIGSERIAL NOT NULL,
    "actor_id" UUID,
    "student_id" UUID,
    "action" TEXT NOT NULL,
    "resource_id" UUID,
    "ip_address" INET,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_university_idx" ON "users"("role", "university");

-- CreateIndex
CREATE INDEX "users_university_is_on_call_idx" ON "users"("university", "is_on_call");

-- CreateIndex
CREATE INDEX "consents_student_id_scope_created_at_idx" ON "consents"("student_id", "scope", "created_at" DESC);

-- CreateIndex
CREATE INDEX "conversations_student_id_started_at_idx" ON "conversations"("student_id", "started_at" DESC);

-- CreateIndex
CREATE INDEX "messages_student_id_created_at_idx" ON "messages"("student_id", "created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "messages_conversation_id_seq_key" ON "messages"("conversation_id", "seq");

-- CreateIndex
CREATE INDEX "agent_outputs_student_id_created_at_idx" ON "agent_outputs"("student_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "agent_outputs_risk_tier_created_at_idx" ON "agent_outputs"("risk_tier", "created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "agent_outputs_message_id_agent_key" ON "agent_outputs"("message_id", "agent");

-- CreateIndex
CREATE INDEX "escalations_status_tier_opened_at_idx" ON "escalations"("status", "tier", "opened_at");

-- CreateIndex
CREATE INDEX "escalations_student_id_opened_at_idx" ON "escalations"("student_id", "opened_at" DESC);

-- CreateIndex
CREATE INDEX "assessments_student_id_instrument_taken_at_idx" ON "assessments"("student_id", "instrument", "taken_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "interventions_code_key" ON "interventions"("code");

-- CreateIndex
CREATE INDEX "intervention_logs_student_id_delivered_at_idx" ON "intervention_logs"("student_id", "delivered_at" DESC);

-- CreateIndex
CREATE INDEX "student_memory_trend_consecutive_decline_days_idx" ON "student_memory"("trend", "consecutive_decline_days" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "knowledge_base_key_key" ON "knowledge_base"("key");

-- CreateIndex
CREATE INDEX "knowledge_base_kind_is_active_idx" ON "knowledge_base"("kind", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "prompt_versions_agent_version_key" ON "prompt_versions"("agent", "version");

-- CreateIndex
CREATE INDEX "notifications_escalation_id_idx" ON "notifications"("escalation_id");

-- CreateIndex
CREATE INDEX "audit_log_student_id_created_at_idx" ON "audit_log"("student_id", "created_at" DESC);

-- AddForeignKey
ALTER TABLE "consents" ADD CONSTRAINT "consents_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_outputs" ADD CONSTRAINT "agent_outputs_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_outputs" ADD CONSTRAINT "agent_outputs_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_outputs" ADD CONSTRAINT "agent_outputs_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escalations" ADD CONSTRAINT "escalations_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escalations" ADD CONSTRAINT "escalations_counselor_id_fkey" FOREIGN KEY ("counselor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escalations" ADD CONSTRAINT "escalations_output_id_fkey" FOREIGN KEY ("output_id") REFERENCES "agent_outputs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "intervention_logs" ADD CONSTRAINT "intervention_logs_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "intervention_logs" ADD CONSTRAINT "intervention_logs_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "intervention_logs" ADD CONSTRAINT "intervention_logs_intervention_id_fkey" FOREIGN KEY ("intervention_id") REFERENCES "interventions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_memory" ADD CONSTRAINT "student_memory_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_escalation_id_fkey" FOREIGN KEY ("escalation_id") REFERENCES "escalations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

