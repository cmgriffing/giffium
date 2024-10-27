import { AiFillCloseCircle, AiOutlineMinus } from 'solid-icons/ai'
import { Dialog } from '@kobalte/core/dialog'
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'

export default function ModalComponent(props: {
  isOpen: boolean
  onClose: () => void
  modalType: string
  openQuestions: number[]
  toggleQuestion: (index: number) => void
}) {
  return (
    <Dialog open={props.isOpen} onOpenChange={props.onClose}>
      <DialogContent class=" bg-white dark:bg-neutral-800 p-6 rounded-lg w-96 shadow-lg">
        <button
          class="absolute top-2 right-2 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition"
          onClick={props.onClose}
          aria-label="Close modal"
        ></button>{' '}
        <DialogDescription class="mb-4">
          {props.modalType === 'how-work' && (
            <>
              <DialogTitle class="text-xl font-semibold mb-4 dialog__title">
                About Giffium
              </DialogTitle>
              <DialogDescription>
                Lorem ipsum dolor sit amet consectetur adipisicing elit. A quidem repudiandae
                praesentium reiciendis tempora mollitia dolorum incidunt quibusdam earum veritatis
                aliquam aperiam debitis cumque, neque iure nihil facere, laudantium obcaecati quod?
                Consectetur, soluta fugit expedita tenetur ratione assumenda impedit doloribus alias
                beatae voluptatibus accusantium repellendus eos mollitia laudantium consequatur
                voluptatum.
              </DialogDescription>
            </>
          )}
          {props.modalType === 'faqs' && (
            <>
              <DialogTitle class="text-xl font-semibold mb-4">FAQs</DialogTitle>
              <DialogDescription as="ul" class="space-y-4">
                <DialogDescription
                  as="li"
                  class="flex items-start cursor-pointer"
                  onClick={() => props.toggleQuestion(1)}
                >
                  <AiOutlineMinus class="text-gray-500 mr-2" />
                  <DialogDescription>
                    <DialogDescription as="span">How do I create a new gif?</DialogDescription>
                    {props.openQuestions.includes(1) && (
                      <DialogDescription as="p" class="mt-2 text-gray-500 dark:text-gray-300">
                        Lorem ipsum dolor sit amet consectetur, adipisicing elit. Nisi atque, a quos
                        fugiat incidunt vero, dicta voluptatem accusamus dolorem laboriosam, beatae
                        commodi possimus sunt ullam eius qui! Rerum ab totam provident est cumque,
                        molestias sit.
                      </DialogDescription>
                    )}
                  </DialogDescription>
                </DialogDescription>
                <DialogDescription
                  as="li"
                  class="flex items-start cursor-pointer"
                  onClick={() => props.toggleQuestion(2)}
                >
                  <AiOutlineMinus class="text-gray-500 mr-2" />
                  <DialogDescription>
                    <DialogDescription as="span">How do I change the theme?</DialogDescription>
                    {props.openQuestions.includes(2) && (
                      <DialogDescription as="p" class="mt-2 text-gray-500 dark:text-gray-300">
                        Lorem ipsum dolor sit amet consectetur, adipisicing elit. Magni nobis
                        consequuntur numquam quasi ad mollitia accusamus, dolorum, soluta aliquam ea
                        blanditiis minima id, dignissimos voluptas? Commodi, unde amet. Repellat
                        incidunt nisi vitae hic asperiores sapiente!
                      </DialogDescription>
                    )}
                  </DialogDescription>
                </DialogDescription>
                <DialogDescription
                  as="li"
                  class="flex items-start cursor-pointer"
                  onClick={() => props.toggleQuestion(3)}
                >
                  <AiOutlineMinus class="text-gray-500 mr-2" />
                  <DialogDescription>
                    <DialogDescription as="span">How do I manage my drafts?</DialogDescription>
                    {props.openQuestions.includes(3) && (
                      <DialogDescription as="p" class="mt-2 text-gray-500 dark:text-gray-300">
                        Lorem, ipsum dolor sit amet consectetur adipisicing elit. Architecto dolorem
                        totam mollitia quisquam laboriosam, sint beatae minus vitae est,
                        perspiciatis non suscipit. Voluptates facilis facere sequi voluptatum
                        laudantium hic saepe tempore, consectetur quibusdam ipsam earum.
                      </DialogDescription>
                    )}
                  </DialogDescription>
                </DialogDescription>
              </DialogDescription>
            </>
          )}
        </DialogDescription>
        <button
          class="mt-4 w-full bg-black text-white py-2 rounded hover:bg-gray-900 transition dark:bg-white dark: dark:text-black"
          onClick={props.onClose}
        >
          Close
        </button>
      </DialogContent>
    </Dialog>
  )
}
