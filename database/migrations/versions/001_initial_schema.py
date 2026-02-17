"""Initial schema

Revision ID: 001
Revises: 
Create Date: 2026-02-17 06:32:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create automations table
    op.create_table(
        'automations',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('tinyfish_automation_id', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('default_inputs', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_automations_id'), 'automations', ['id'], unique=False)
    op.create_index(op.f('ix_automations_name'), 'automations', ['name'], unique=False)
    
    # Create scenarios table
    op.create_table(
        'scenarios',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('automation_id', sa.Integer(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('inputs_template', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('run_settings', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['automation_id'], ['automations.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_scenarios_id'), 'scenarios', ['id'], unique=False)
    op.create_index(op.f('ix_scenarios_name'), 'scenarios', ['name'], unique=False)
    
    # Create runs table
    op.create_table(
        'runs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('scenario_id', sa.Integer(), nullable=False),
        sa.Column('started_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('finished_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('total_duration_ms', sa.Float(), nullable=True),
        sa.Column('ttft_ms', sa.Float(), nullable=True),
        sa.Column('inter_token_stats', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('error', sa.Text(), nullable=True),
        sa.Column('tinyfish_run_id', sa.String(length=255), nullable=True),
        sa.Column('response_json', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['scenario_id'], ['scenarios.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_runs_id'), 'runs', ['id'], unique=False)
    op.create_index(op.f('ix_runs_status'), 'runs', ['status'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_runs_status'), table_name='runs')
    op.drop_index(op.f('ix_runs_id'), table_name='runs')
    op.drop_table('runs')
    
    op.drop_index(op.f('ix_scenarios_name'), table_name='scenarios')
    op.drop_index(op.f('ix_scenarios_id'), table_name='scenarios')
    op.drop_table('scenarios')
    
    op.drop_index(op.f('ix_automations_name'), table_name='automations')
    op.drop_index(op.f('ix_automations_id'), table_name='automations')
    op.drop_table('automations')
