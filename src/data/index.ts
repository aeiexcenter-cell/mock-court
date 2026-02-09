// import { DEFAULT_CASE } from './cases/defaultCase';
import { CASE_DATA } from './cases/江公北诉字[2016]03449号/defaultCase';

// Export the currently active case
// This acts as a single point of configuration
export const activeCase = CASE_DATA;

// Re-export the default case just in case specific direct access is needed
export { CASE_DATA as DEFAULT_CASE };
