export interface TestCase {
    id: number
    user_story_id: number
    test_suite_id: number
    title: string
    summary: string
    precondition: string
    postcondition: string
    status: string
    manual_edit: boolean
    importance: string
    execution_type: string
    created_at: string
    updated_at: string
    test_steps: TestStep[]
  }
  
  export interface TestStep {
    id: number
    test_case_id: number
    step_number: number
    step_action: string
    expected_result: string
    execution_type: string
  }
  