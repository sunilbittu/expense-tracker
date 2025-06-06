import React, { useState, useEffect } from 'react';
import { AlertTriangle, Database, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { 
  migrateLocalStorageToAPI, 
  hasLocalStorageData, 
  getLocalStorageDataCount, 
  clearMigratedLocalStorageData,
  markMigrationCompleted,
  shouldShowMigrationPrompt 
} from '../utils/dataMigration';

interface DataMigrationProps {
  onMigrationComplete?: () => void;
}

const DataMigration: React.FC<DataMigrationProps> = ({ onMigrationComplete }) => {
  const [showMigration, setShowMigration] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [migrationResult, setMigrationResult] = useState<any>(null);
  const [dataCount, setDataCount] = useState({ expenses: 0, employees: 0, customerPayments: 0 });

  useEffect(() => {
    // Check if migration prompt should be shown
    if (shouldShowMigrationPrompt()) {
      setShowMigration(true);
      setDataCount(getLocalStorageDataCount());
    }
  }, []);

  const handleMigrate = async () => {
    setIsLoading(true);
    try {
      const result = await migrateLocalStorageToAPI();
      setMigrationResult(result);
      
      if (result.success) {
        // Mark migration as completed
        markMigrationCompleted();
        
        // Optionally clear localStorage data
        setTimeout(() => {
          clearMigratedLocalStorageData();
          onMigrationComplete?.();
        }, 2000);
      }
    } catch (error) {
      console.error('Migration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    markMigrationCompleted();
    setShowMigration(false);
    onMigrationComplete?.();
  };

  const handleDismiss = () => {
    setShowMigration(false);
  };

  if (!showMigration) {
    return null;
  }

  const totalItems = dataCount.expenses + dataCount.employees + dataCount.customerPayments;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-8 w-8 text-amber-500" />
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-gray-900">
                Data Migration Required
              </h3>
              <p className="text-sm text-gray-500">
                We found local data that needs to be migrated to the cloud
              </p>
            </div>
          </div>

          {/* Migration Result */}
          {migrationResult && (
            <div className={`mb-4 p-4 rounded-lg ${
              migrationResult.success 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center">
                {migrationResult.success ? (
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500 mr-2" />
                )}
                <span className={`font-medium ${
                  migrationResult.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {migrationResult.success ? 'Migration Successful!' : 'Migration Failed'}
                </span>
              </div>
              
              {migrationResult.success && (
                <div className="mt-2 text-sm text-green-700">
                  <p>Successfully migrated:</p>
                  <ul className="list-disc list-inside ml-4">
                    {migrationResult.migrated.expenses > 0 && (
                      <li>{migrationResult.migrated.expenses} expenses</li>
                    )}
                    {migrationResult.migrated.employees > 0 && (
                      <li>{migrationResult.migrated.employees} employees</li>
                    )}
                    {migrationResult.migrated.customerPayments > 0 && (
                      <li>{migrationResult.migrated.customerPayments} customer payments</li>
                    )}
                  </ul>
                </div>
              )}

              {migrationResult.errors.length > 0 && (
                <div className="mt-2 text-sm text-red-700">
                  <p>Errors encountered:</p>
                  <ul className="list-disc list-inside ml-4">
                    {migrationResult.errors.slice(0, 3).map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                    {migrationResult.errors.length > 3 && (
                      <li>... and {migrationResult.errors.length - 3} more errors</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Data Summary */}
          {!migrationResult && (
            <div className="mb-6">
              <div className="flex items-center mb-3">
                <Database className="h-5 w-5 text-blue-500 mr-2" />
                <span className="font-medium text-gray-900">
                  Found {totalItems} items to migrate:
                </span>
              </div>
              
              <div className="space-y-2 ml-7">
                {dataCount.expenses > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Expenses:</span>
                    <span className="font-medium">{dataCount.expenses}</span>
                  </div>
                )}
                {dataCount.employees > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Employees:</span>
                    <span className="font-medium">{dataCount.employees}</span>
                  </div>
                )}
                {dataCount.customerPayments > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Customer Payments:</span>
                    <span className="font-medium">{dataCount.customerPayments}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>What happens during migration?</strong>
                </p>
                <ul className="text-xs text-blue-700 mt-1 space-y-1">
                  <li>• Your local data will be safely uploaded to the cloud</li>
                  <li>• You'll be able to access your data from any device</li>
                  <li>• Local data will be cleared after successful migration</li>
                  <li>• This process is secure and encrypted</li>
                </ul>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            {!migrationResult ? (
              <>
                <button
                  onClick={handleMigrate}
                  disabled={isLoading}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Migrating...
                    </>
                  ) : (
                    <>
                      <Database className="h-4 w-4 mr-2" />
                      Migrate Data
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleSkip}
                  disabled={isLoading}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                >
                  Skip
                </button>
              </>
            ) : (
              <button
                onClick={handleDismiss}
                className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                Close
              </button>
            )}
          </div>

          {/* Warning for Skip */}
          {!migrationResult && (
            <div className="mt-3 text-xs text-gray-500 text-center">
              <p>
                <strong>Warning:</strong> Skipping migration will keep your data local only. 
                You can migrate later from Settings.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataMigration; 