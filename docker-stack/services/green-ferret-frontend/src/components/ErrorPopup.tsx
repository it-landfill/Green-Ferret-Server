interface MessageProps {
  title: string;
  message: string;
  hideErrorMessagePopup: any;
}

function ErrorMessagePopup(props: MessageProps) {
  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center w-full h-full bg-gray-900 bg-opacity-60">
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
      <div className="fixed inset-0 z-10 overflow-y-auto">
        <div className=" flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div className="relative transform overflow-hidden rounded-lg bg-gray-50 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
            <div className="px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                  <h3 className="text-base font-semibold leading-6 text-gray-800">
                    {props.title}
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">{props.message}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className=" px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              <button
                type="button"
                className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 sm:ml-3 sm:w-auto"
                onClick={props.hideErrorMessagePopup}
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ErrorMessagePopup;
