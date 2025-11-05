export const assignmentsData = {
  assignments: [
    {
      id: 1,
      title: "Assignment 1",
      topic: "Socket Programming (Echo Server)",
      files: [
        {
          file_name: "EchoServer.java",
          language: "Java",
          code: `import java.io.*;
import java.net.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

public class EchoServer {
  private static final int PORT = 5000;
  private static final int MAX_CLIENTS = 50;
  // To assign unique IDs to clients (Client 1, 2, 3...)
  private static final AtomicInteger clientCounter = new AtomicInteger(0);

  public static void main(String[] args) {
    ExecutorService clientPool = Executors.newFixedThreadPool(MAX_CLIENTS);

    try (ServerSocket serverSocket = new ServerSocket(PORT)) {
      System.out.println("Echo Server started on port " + PORT);

      while (true) {
        Socket clientSocket = serverSocket.accept();
        int clientId = clientCounter.incrementAndGet(); // Assign unique client number
        System.out.println(
          "Client " + clientId + " connected: " + clientSocket.getInetAddress() + ":" + clientSocket.getPort()
        );
        clientPool.execute(new ClientHandler(clientId, clientSocket));
      }
    } catch (IOException e) {
      System.err.println("Server error: " + e.getMessage());
    } finally {
      clientPool.shutdown();
    }
  }
}

class ClientHandler implements Runnable {
  private final int clientId;
  private final Socket socket;

  public ClientHandler(int clientId, Socket socket) {
    this.clientId = clientId;
    this.socket = socket;
  }

  @Override
  public void run() {
    try (
      BufferedReader in = new BufferedReader(new InputStreamReader(socket.getInputStream()));
      PrintWriter out = new PrintWriter(socket.getOutputStream(), true)
    ) {
      String message;
      while ((message = in.readLine()) != null) {
        System.out.println("Received from Client " + clientId + ": \"" + message + "\"");
        out.println("Echo from server: " + message);
      }
    } catch (IOException e) {
      System.err.println("Client " + clientId + " error: " + e.getMessage());
    } finally {
      try {
        System.out.println("Client " + clientId + " disconnected (" + socket.getInetAddress() + ")");
        socket.close();
      } catch (IOException e) {
        System.err.println("Error closing Client " + clientId + " socket: " + e.getMessage());
      }
    }
  }
}`,
        },
        {
          file_name: "EchoClient.java",
          language: "Java",
          code: `import java.io.*;
import java.net.*;

public class EchoClient {
  private static final String SERVER_ADDRESS = "localhost";
  private static final int SERVER_PORT = 5000;

  public static void main(String[] args) {
    try (
      Socket socket = new Socket(SERVER_ADDRESS, SERVER_PORT);
      BufferedReader console = new BufferedReader(new InputStreamReader(System.in));
      BufferedReader in = new BufferedReader(new InputStreamReader(socket.getInputStream()));
      PrintWriter out = new PrintWriter(socket.getOutputStream(), true)
    ) {
      System.out.println("Connected to Echo Server at " + SERVER_ADDRESS + ":" + SERVER_PORT);
      System.out.println("Type message (type 'exit' to quit):");

      String userInput;
      while (true) {
        System.out.print("You: ");
        userInput = console.readLine();

        if (userInput == null || "exit".equalsIgnoreCase(userInput.trim())) {
          System.out.println("Disconnecting from server...");
          break;
        }

        out.println(userInput); // send to server
        String response = in.readLine(); // read server echo

        if (response == null) {
          System.out.println("Server closed the connection.");
          break;
        }

        System.out.println("Server: " + response);
      }
    } catch (UnknownHostException e) {
      System.err.println("Unknown server: " + SERVER_ADDRESS);
    } catch (IOException e) {
      System.err.println("I/O error: " + e.getMessage());
    }
  }
}`,
        },
      ],
      run_instructions: [
        "javac EchoServer.java EchoClient.java",
        "java EchoServer",
        "In another terminal: java EchoClient",
      ],
    },
    {
      id: 2,
      title: "Assignment 2",
      topic: "RMI (Remote Method Invocation)",
      files: [
        {
          file_name: "Adder.java",
          language: "Java",
          code: `import java.rmi.*;

public interface Adder extends Remote {
  int add(int x, int y, int clientPort) throws RemoteException;
}`,
        },
        {
          file_name: "AdderRemote.java",
          language: "Java",
          code: `import java.rmi.*;
import java.rmi.server.*;

public class AdderRemote extends UnicastRemoteObject implements Adder {
  AdderRemote() throws RemoteException {
    super();
  }

  public int add(int x, int y, int clientPort) {
    int sum = x + y;
    try {
      String clientHost = RemoteServer.getClientHost();
      System.out.println("Client [" + clientHost + ":" + clientPort + "] requested: " + x + " + " + y);
      System.out.println("Sum is: " + sum);
    } catch (Exception e) {
      System.out.println("Could not fetch client host. Request: " + x + " + " + y + " = " + sum);
    }
    return sum;
  }
}`,
        },
        {
          file_name: "MyServer.java",
          language: "Java",
          code: `import java.rmi.*;
import java.rmi.registry.*;

public class MyServer {
  public static void main(String[] args) {
    try {
      Adder stub = new AdderRemote();
      LocateRegistry.createRegistry(3000);
      Naming.rebind("rmi://localhost:3000/Pooja", stub);
      System.out.println("Server ready...");
    } catch (Exception e) {
      e.printStackTrace();
    }
  }
}`,
        },
        {
          file_name: "MyClient.java",
          language: "Java",
          code: `import java.rmi.*;
import java.util.Scanner;
import java.net.*;

public class MyClient {
  public static void main(String[] args) {
    try {
      Adder stub = (Adder) Naming.lookup("rmi://localhost:3000/Pooja");

      Scanner sc = new Scanner(System.in);
      System.out.print("Enter first number: ");
      int a = sc.nextInt();
      System.out.print("Enter second number: ");
      int b = sc.nextInt();

      // Get the local port for differentiation
      Socket tempSocket = new Socket("localhost", 3000);
      int clientPort = tempSocket.getLocalPort();
      tempSocket.close();

      int result = stub.add(a, b, clientPort);
      System.out.println("Sum from server: " + result);
      sc.close();
    } catch (Exception e) {
      System.out.println("Error: " + e);
    }
  }
}`,
        },
      ],
      run_instructions: [
        "Step 1: Open PowerShell in your Assignment2 folder",
        "Step 2: Compile all Java files: javac Adder.java AdderRemote.java MyServer.java MyClient.java",
        "Step 3: Start the Server (creates the RMI Registry): java MyServer",
        "Step 4: Open a new PowerShell window and run the client: java MyClient",
        "Step 5: (Optional) Launch more clients in separate windows to test multiple connections",
        "Step 6: Stop the server with Ctrl + C",
      ],
    },
    {
      id: 3,
      title: "Assignment 3: CORBA",
      topic: "CORBA (Common Object Request Broker Architecture)",
      parts: [
        {
          title:
            "Example 1: Multi-Service Server (String, Calculator, Factorial)",
          files: [
            {
              file_name: "StringApp/String.idl",
              language: "IDL",
              code: `module StringApp {
  interface StringOps {
    string reverse(in string input);
    string toUpper(in string input);
  };
};`,
            },
            {
              file_name: "CalculatorApp/Calculator.idl",
              language: "IDL",
              code: `module CalculatorApp {
  interface Calculator {
    float add(in float a, in float b);
    float sub(in float a, in float b);
    float mul(in float a, in float b);
    float div(in float a, in float b);
  };
};`,
            },
            {
              file_name: "FactorialApp/Factorial.idl",
              language: "IDL",
              code: `module FactorialApp {
  interface Factorial {
    long compute(in long n);
  };
};`,
            },
            {
              file_name: "StringApp/StringImpl.java",
              language: "Java",
              code: `package StringApp;

import org.omg.CORBA.*;

public class StringImpl extends StringOpsPOA {
  public String reverse(String input) {
    return new StringBuilder(input).reverse().toString();
  }

  public String toUpper(String input) {
    return input.toUpperCase();
  }
}`,
            },
            {
              file_name: "CalculatorApp/CalculatorImpl.java",
              language: "Java",
              code: `package CalculatorApp;

import org.omg.CORBA.*;

public class CalculatorImpl extends CalculatorPOA {
  public float add(float a, float b) { return a + b; }
  public float sub(float a, float b) { return a - b; }
  public float mul(float a, float b) { return a * b; }
  public float div(float a, float b) { return a / b; }
}`,
            },
            {
              file_name: "FactorialApp/FactorialImpl.java",
              language: "Java",
              code: `package FactorialApp;

import org.omg.CORBA.*;

public class FactorialImpl extends FactorialPOA {
  public long compute(long n) {
    if (n <= 1) return 1;
    return n * compute(n - 1);
  }
}

/*
Note: If idlj generates 'int compute(int n)', use this implementation instead:

package FactorialApp;
import org.omg.CORBA.*;

public class FactorialImpl extends FactorialPOA {
  public int compute(int n) {
    if (n <= 1) return 1;
    return n * compute(n - 1);
  }
}

*/`,
            },
            {
              file_name: "Server.java",
              language: "Java",
              code: `import StringApp.*;
import CalculatorApp.*;
import FactorialApp.*;
import org.omg.CORBA.*;
import org.omg.PortableServer.*;
import org.omg.CosNaming.*;

public class Server {
  public static void main(String[] args) {
    try {
      ORB orb = ORB.init(args, null);
      POA rootpoa = POAHelper.narrow(orb.resolve_initial_references("RootPOA"));
      rootpoa.the_POAManager().activate();

      // Create & register services
      StringImpl strImpl = new StringImpl();
      CalculatorImpl calcImpl = new CalculatorImpl();
      FactorialImpl factImpl = new FactorialImpl();

      org.omg.CORBA.Object ref1 = rootpoa.servant_to_reference(strImpl);
      org.omg.CORBA.Object ref2 = rootpoa.servant_to_reference(calcImpl);
      org.omg.CORBA.Object ref3 = rootpoa.servant_to_reference(factImpl);

      StringOps strRef = StringOpsHelper.narrow(ref1);
      Calculator calcRef = CalculatorHelper.narrow(ref2);
      Factorial factRef = FactorialHelper.narrow(ref3);

      org.omg.CORBA.Object objRef = orb.resolve_initial_references("NameService");
      NamingContextExt ncRef = NamingContextExtHelper.narrow(objRef);

      ncRef.rebind(ncRef.to_name("StringService"), strRef);
      ncRef.rebind(ncRef.to_name("CalculatorService"), calcRef);
      ncRef.rebind(ncRef.to_name("FactorialService"), factRef);

      System.out.println("✅ All services registered.");
      orb.run();
    } catch (Exception e) {
      e.printStackTrace();
    }
  }
}`,
            },
            {
              file_name: "Client1.java",
              language: "Java",
              code: `import StringApp.*;
import org.omg.CORBA.*;
import org.omg.CosNaming.*;

public class Client1 {
  public static void main(String[] args) {
    try {
      ORB orb = ORB.init(args, null);
      org.omg.CORBA.Object objRef = orb.resolve_initial_references("NameService");
      NamingContextExt ncRef = NamingContextExtHelper.narrow(objRef);

      StringOps str = StringOpsHelper.narrow(ncRef.resolve_str("StringService"));
      System.out.println("Reverse: " + str.reverse("Distributed"));
      System.out.println("Upper: " + str.toUpper("computing"));
    } catch (Exception e) {
      e.printStackTrace();
    }
  }
}`,
            },
            {
              file_name: "Client2.java",
              language: "Java",
              code: `import CalculatorApp.*;
import FactorialApp.*;
import org.omg.CORBA.*;
import org.omg.CosNaming.*;

public class Client2 {
  public static void main(String[] args) {
    try {
      ORB orb = ORB.init(args, null);
      org.omg.CORBA.Object objRef = orb.resolve_initial_references("NameService");
      NamingContextExt ncRef = NamingContextExtHelper.narrow(objRef);

      Calculator calc = CalculatorHelper.narrow(ncRef.resolve_str("CalculatorService"));
      Factorial fact = FactorialHelper.narrow(ncRef.resolve_str("FactorialService"));

      System.out.println("Addition: " + calc.add(10, 20));
      System.out.println("Multiplication: " + calc.mul(5, 4));
      System.out.println("Factorial(5): " + fact.compute(5));
    } catch (Exception e) {
      e.printStackTrace();
    }
  }
}`,
            },
          ],
          run_instructions: [
            "Download/install a JDK with CORBA support (e.g., Zulu JDK 8/11) and add bin to PATH",
            "Create root folder with subfolders: StringApp, CalculatorApp, FactorialApp",
            "Place String.idl, Calculator.idl, Factorial.idl in their respective folders",
            "Run idlj -fall StringApp/String.idl",
            "Run idlj -fall CalculatorApp/Calculator.idl",
            "Run idlj -fall FactorialApp/Factorial.idl",
            "Add StringImpl.java, CalculatorImpl.java, FactorialImpl.java to respective folders",
            "Place Server.java, Client1.java, Client2.java in root folder",
            "Compile: javac StringApp/*.java CalculatorApp/*.java FactorialApp/*.java Server.java Client1.java Client2.java",
            "Troubleshoot Factorial signature if needed, then recompile",
            "Terminal 1: orbd -ORBInitialPort 1050",
            "Terminal 2: java Server -ORBInitialHost localhost -ORBInitialPort 1050",
            "Terminal 3: java Client1 -ORBInitialHost localhost -ORBInitialPort 1050",
            "Terminal 4: java Client2 -ORBInitialHost localhost -ORBInitialPort 1050",
            "If port conflict occurs, choose a new ORBInitialPort (e.g., 1051) everywhere",
          ],
        },
        {
          title: "Example 2: Simple 'Hello' Service",
          files: [
            {
              file_name: "Hello.idl",
              language: "IDL",
              code: `module HelloApp {
  interface Hello {
    string sayHello(in string name);
  };
};`,
            },
            {
              file_name: "HelloApp/HelloImpl.java",
              language: "Java",
              code: `package HelloApp;

import org.omg.CORBA.*;

public class HelloImpl extends HelloPOA {
  private ORB orb;

  public void setORB(ORB orb_val) {
    orb = orb_val;
  }

  @Override
  public String sayHello(String name) {
    System.out.println("Request from client: " + name);
    return "Hello, " + name + " (from CORBA Server)";
  }
}`,
            },
            {
              file_name: "Server.java",
              language: "Java",
              code: `import HelloApp.*;
import org.omg.CORBA.*;
import org.omg.PortableServer.*;
import org.omg.CosNaming.*;

public class Server {
  public static void main(String[] args) {
    try {
      ORB orb = ORB.init(args, null);

      POA rootpoa = POAHelper.narrow(orb.resolve_initial_references("RootPOA"));
      rootpoa.the_POAManager().activate();

      HelloImpl helloImpl = new HelloImpl();
      helloImpl.setORB(orb);

      org.omg.CORBA.Object ref = rootpoa.servant_to_reference(helloImpl);
      Hello href = HelloHelper.narrow(ref);

      org.omg.CORBA.Object objRef = orb.resolve_initial_references("NameService");
      NamingContextExt ncRef = NamingContextExtHelper.narrow(objRef);

      String name = "HelloService";
      NameComponent[] path = ncRef.to_name(name);
      ncRef.rebind(path, href);

      System.out.println("Server ready...");
      orb.run();
    } catch (Exception e) {
      e.printStackTrace();
    }
  }
}`,
            },
            {
              file_name: "Client.java",
              language: "Java",
              code: `import HelloApp.*;
import org.omg.CORBA.*;
import org.omg.CosNaming.*;

public class Client {
  public static void main(String[] args) {
    try {
      ORB orb = ORB.init(args, null);

      org.omg.CORBA.Object objRef = orb.resolve_initial_references("NameService");
      NamingContextExt ncRef = NamingContextExtHelper.narrow(objRef);

      String name = "HelloService";
      Hello helloRef = HelloHelper.narrow(ncRef.resolve_str(name));

      System.out.println("Got reference to HelloService");
      String result = helloRef.sayHello("Student");
      System.out.println("Response from server: " + result);
    } catch (Exception e) {
      e.printStackTrace();
    }
  }
}`,
            },
          ],
          run_instructions: [
            "Create project root folder",
            "Place Hello.idl in root",
            "Run idlj -fall Hello.idl",
            "Create HelloApp/HelloImpl.java",
            "Create Server.java and Client.java in root",
            "Compile: javac HelloApp/*.java Server.java Client.java",
            "Terminal 1: orbd -ORBInitialPort 1050",
            "Terminal 2: java Server -ORBInitialHost localhost -ORBInitialPort 1050",
            "Terminal 3: java Client -ORBInitialHost localhost -ORBInitialPort 1050",
          ],
        },
      ],
    },
    {
      id: 4,
      title: "Assignment 4: Berkeley",
      topic: "Berkeley Clock Synchronization Algorithm",
      files: [
        {
          file_name: "Berkeley.java",
          language: "Java",
          code: `package fourth_updated;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.List;

class Node {
  final int id;
  long clockOffsetMs;
  boolean alive = true;

  Node(int id, long offsetMs) {
    this.id = id;
    this.clockOffsetMs = offsetMs;
  }

  long currentTime() {
    return System.currentTimeMillis() + clockOffsetMs;
  }
}

public class Berkeley {
  static String formatTime(long ms) {
    SimpleDateFormat sdf = new SimpleDateFormat("HH:mm:ss");
    return sdf.format(new Date(ms));
  }

  public static void main(String[] args) {
    List<Node> nodes = new ArrayList<>();
    nodes.add(new Node(0, 0));      // master
    nodes.add(new Node(1, 500));    // +0.5 sec
    nodes.add(new Node(2, -800));   // -0.8 sec
    nodes.add(new Node(3, 1200));   // +1.2 sec
    nodes.add(new Node(4, -300));   // -0.3 sec

    Node master = nodes.get(0);
    List<Long> samples = new ArrayList<>();

    for (Node n : nodes) {
      if (!n.alive) {
        continue;
      }
      samples.add(n.currentTime());
    }

    Collections.sort(samples);
    int trim = Math.max(0, samples.size() / 10);
    List<Long> trimmed = samples.subList(trim, samples.size() - trim);

    long sum = 0;
    for (long t : trimmed) {
      sum += t;
    }
    long avg = sum / trimmed.size();

    System.out.println("--------------------------------------------------");
    System.out.println(" Before Synchronization ");
    System.out.println("--------------------------------------------------");
    for (Node n : nodes) {
      if (n.alive) {
        System.out.printf(
          "Node %d Time: %s (Offset: %d ms)%n",
          n.id,
          formatTime(n.currentTime()),
          n.clockOffsetMs
        );
      } else {
        System.out.printf("Node %d is inactive%n", n.id);
      }
    }

    for (Node n : nodes) {
      if (n.alive) {
        long adjust = avg - n.currentTime();
        n.clockOffsetMs += adjust;
      }
    }

    System.out.println("\n--------------------------------------------------");
    System.out.println(" After Synchronization ");
    System.out.println("--------------------------------------------------");
    for (Node n : nodes) {
      if (n.alive) {
        System.out.printf(
          "Node %d Time: %s (Offset: %d ms)%n",
          n.id,
          formatTime(n.currentTime()),
          n.clockOffsetMs
        );
      } else {
        System.out.printf("Node %d is inactive%n", n.id);
      }
    }

    System.out.println("--------------------------------------------------");
    System.out.println("Average (Reference) Time: " + formatTime(avg));
    System.out.println("--------------------------------------------------");
  }
}`,
        },
      ],
      run_instructions: [
        "Save Berkeley.java inside a folder named fourth_updated",
        "From the parent directory, compile: javac fourth_updated/Berkeley.java",
        "Run: java fourth_updated.Berkeley",
      ],
    },
    {
      id: 5,
      title: "Assignment 5 (Election Algorithm)",
      topic: "Election Algorithms (Bully and Ring)",
      files: [
        {
          file_name: "BullyAlgorithm.java",
          language: "Java",
          code: `import java.util.*;

class Process {
  int id;
  boolean active;

  Process(int id) {
    this.id = id;
    this.active = true;
  }
}

public class BullyAlgorithm {
  static Process[] processes;
  static int coordinator;

  public static void main(String[] args) {
    Scanner sc = new Scanner(System.in);
    System.out.print("Enter number of processes: ");
    int n = sc.nextInt();
    processes = new Process[n];

    for (int i = 0; i < n; i++) {
      processes[i] = new Process(i + 1);
    }

    coordinator = n; // Highest ID is coordinator initially
    System.out.println("Process " + coordinator + " is the coordinator.");

    while (true) {
      System.out.println("\n1. Crash process");
      System.out.println("2. Recover process");
      System.out.println("3. Start election");
      System.out.println("4. Exit");
      System.out.print("Enter choice: ");
      int ch = sc.nextInt();

      switch (ch) {
        case 1 -> {
          System.out.print("Enter process to crash: ");
          int crash = sc.nextInt();
          processes[crash - 1].active = false;
          if (crash == coordinator) {
            System.out.println("Coordinator crashed!");
          }
        }
        case 2 -> {
          System.out.print("Enter process to recover: ");
          int recover = sc.nextInt();
          processes[recover - 1].active = true;
          System.out.println("Process " + recover + " recovered.");
          startElection(recover);
        }
        case 3 -> {
          System.out.print("Enter process initiating election: ");
          int initiator = sc.nextInt();
          startElection(initiator);
        }
        case 4 -> {
          System.out.println("Exiting...");
          System.exit(0);
        }
        default -> System.out.println("Invalid choice");
      }
    }
  }

  static void startElection(int initiator) {
    System.out.println("Election initiated by Process " + initiator);
    int newCoordinator = -1;

    for (int i = initiator; i < processes.length; i++) {
      if (processes[i].active) {
        System.out.println("Process " + (i + 1) + " responded OK");
        newCoordinator = i + 1;
      }
    }

    if (newCoordinator == -1) {
      newCoordinator = initiator;
    }

    coordinator = newCoordinator;
    System.out.println("Process " + coordinator + " becomes the new coordinator.");
  }
}`,
        },
        {
          file_name: "RingElection.java",
          language: "Java",
          code: `import java.util.*;

class Process {
  int index;
  int id;
  boolean isActive;

  Process(int index, int id) {
    this.index = index;
    this.id = id;
    this.isActive = true;
  }
}

public class RingElection {
  static final Scanner sc = new Scanner(System.in);
  static final List<Process> ring = new ArrayList<>();

  public static void main(String[] args) {
    System.out.print("Enter number of processes: ");
    int n = sc.nextInt();

    for (int i = 0; i < n; i++) {
      System.out.print("Enter ID for process " + i + ": ");
      int id = sc.nextInt();
      ring.add(new Process(i, id));
    }

    ring.get(n - 1).isActive = false;
    System.out.println("Process " + ring.get(n - 1).id + " is set as inactive (coordinator down)");

    while (true) {
      System.out.println("\nMenu:\n1. Start Election\n2. Exit");
      int choice = sc.nextInt();

      if (choice == 1) {
        System.out.print("Enter initiator process ID: ");
        int initiatorId = sc.nextInt();
        startElection(initiatorId);
      } else {
        break;
      }
    }
  }

  static void startElection(int initiatorId) {
    int n = ring.size();
    int initiatorIndex = -1;

    for (int i = 0; i < n; i++) {
      if (ring.get(i).id == initiatorId && ring.get(i).isActive) {
        initiatorIndex = i;
        break;
      }
    }

    if (initiatorIndex == -1) {
      System.out.println("Invalid initiator or process is inactive.");
      return;
    }

    System.out.println("Election initiated by Process " + initiatorId);

    List<Integer> electionIds = new ArrayList<>();
    int currentIndex = initiatorIndex;

    do {
      Process p = ring.get(currentIndex);
      if (p.isActive) {
        System.out.println("Process " + p.id + " received election message.");
        electionIds.add(p.id);
      }
      currentIndex = (currentIndex + 1) % n;
    } while (currentIndex != initiatorIndex);

    int newCoordinatorId = Collections.max(electionIds);
    System.out.println("Election complete. New coordinator is Process " + newCoordinatorId);

    currentIndex = initiatorIndex;
    do {
      Process p = ring.get(currentIndex);
      if (p.isActive) {
        System.out.println("Process " + p.id + " notified: New coordinator is Process " + newCoordinatorId);
      }
      currentIndex = (currentIndex + 1) % n;
    } while (currentIndex != initiatorIndex);
  }
}`,
        },
      ],
      run_instructions: [
        "javac BullyAlgorithm.java",
        "java BullyAlgorithm",
        "javac RingElection.java",
        "java RingElection",
      ],
    },
    {
      id: 6,
      title: "Assignment 6 Map Reduce (python code)",
      topic: "MapReduce (Word Count)",
      files: [
        {
          file_name: "mapReduce.py",
          language: "Python",
          code: `import re
from collections import defaultdict


# --- Step 1: Mapper Function ---
def mapper(document):
  """
  Reads a document, cleans it, and emits (word, 1) for each word.
  """
  text = document.lower()
  text = re.sub(r"[^\w\s]", "", text)
  words = text.split()
  for word in words:
    if word:
      yield (word, 1)


# --- Step 2: Reducer Function ---
def reducer(key, values):
  """
  Sums the values for a given key.
  """
  total = sum(values)
  yield (key, total)


if __name__ == "__main__":
  documents = [
    "Data science is the future of technology and business intelligence.",
    "Machine learning algorithms can analyze massive amounts of data efficiently.",
    "Big data analytics helps companies make better business decisions.",
    "Python programming is essential for data science and machine learning projects.",
  ]

  print("--- Input Documents ---")
  for doc in documents:
    print(f"- {doc}")
  print("\n" + "=" * 30 + "\n")

  print("--- 1. Map Phase ---")
  mapped_pairs = []
  for doc in documents:
    for pair in mapper(doc):
      mapped_pairs.append(pair)
      print(f"  Mapper output: {pair}")
  print("\n" + "=" * 30 + "\n")

  print("--- 2. Shuffle & Sort Phase (Grouping) ---")
  shuffled_data = defaultdict(list)
  for key, value in mapped_pairs:
    shuffled_data[key].append(value)
  for key, values in sorted(shuffled_data.items()):
    print(f"  Grouped: ('{key}', {values})")
  print("\n" + "=" * 30 + "\n")

  print("--- 3. Reduce Phase ---")
  final_counts = {}
  for key, values in sorted(shuffled_data.items()):
    for result_key, result_value in reducer(key, values):
      final_counts[result_key] = result_value
      print(f"  Reducer output: ('{result_key}', {result_value})")
  print("\n" + "=" * 30 + "\n")

  print("--- Final Word Count Results ---")
  sorted_results = sorted(final_counts.items(), key=lambda item: item[1], reverse=True)
  for word, count in sorted_results:
    print(f"{word:<15} {count}")
`,
        },
      ],
      run_instructions: ["python mapReduce.py"],
    },
    {
      id: 7,
      title: "Assignment 7 termination detection",
      topic: "Termination Detection",
      files: [
        {
          file_name: "TerminationDetection.java",
          language: "Java",
          code: `import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;

public class TerminationDetection {
  private static final ConcurrentLinkedQueue<Message> messageQueue = new ConcurrentLinkedQueue<>();
  private static final AtomicBoolean terminated = new AtomicBoolean(false);
  private static final Random random = new Random();

  static class Message {
    final int senderId;
    final int receiverId;
    final String type;

    Message(int senderId, int receiverId, String type) {
      this.senderId = senderId;
      this.receiverId = receiverId;
      this.type = type;
    }
  }

  static class Process extends Thread {
    private final int id;
    private boolean isActive;
    private final AtomicInteger deficit;
    private final List<Integer> children;
    private final List<Integer> parents;
    private final boolean isInitiator;

    Process(int id, boolean isInitiator) {
      this.id = id;
      this.isActive = true;
      this.deficit = new AtomicInteger(0);
      this.children = new ArrayList<>();
      this.parents = new ArrayList<>();
      this.isInitiator = isInitiator;
    }

    @Override
    public void run() {
      if (isInitiator) {
        sendMessages();
      }

      while (!terminated.get()) {
        if (isActive) {
          try {
            Thread.sleep(100);
          } catch (InterruptedException ignored) {
          }

          if (random.nextDouble() < 0.7) {
            becomePassive();
          } else {
            sendMessages();
          }
        } else {
          processMessages();
        }

        if (isInitiator && !isActive && children.isEmpty() && deficit.get() == 0) {
          terminated.set(true);
          System.out.println("Process " + id + " detected termination.");
          return;
        }
      }
    }

    private void sendMessages() {
      int numMessages = random.nextInt(2);
      for (int i = 0; i < numMessages; i++) {
        int receiverId = random.nextInt(5);
        if (receiverId != id) {
          deficit.incrementAndGet();
          synchronized (children) {
            children.add(receiverId);
          }
          messageQueue.add(new Message(id, receiverId, "COMPUTATION"));
          System.out.println("Process " + id + " sent COMPUTATION to Process " + receiverId);
        }
      }
    }

    private void processMessages() {
      Message msg = messageQueue.poll();
      if (msg != null && msg.receiverId == id) {
        if ("COMPUTATION".equals(msg.type)) {
          isActive = true;
          synchronized (parents) {
            parents.add(msg.senderId);
          }
          System.out.println("Process " + id + " received COMPUTATION from Process " + msg.senderId);
        } else if ("SIGNAL".equals(msg.type)) {
          deficit.decrementAndGet();
          synchronized (children) {
            children.remove(Integer.valueOf(msg.senderId));
          }
          System.out.println("Process " + id + " received SIGNAL from Process " + msg.senderId);
        }
      } else if (msg != null) {
        messageQueue.add(msg);
      }
    }

    private void becomePassive() {
      isActive = false;
      System.out.println("Process " + id + " became passive.");

      synchronized (parents) {
        for (Integer parentId : parents) {
          messageQueue.add(new Message(id, parentId, "SIGNAL"));
          System.out.println("Process " + id + " sent SIGNAL to Process " + parentId);
        }
      }
    }
  }

  public static void main(String[] args) {
    Process[] processes = new Process[5];
    for (int i = 0; i < processes.length; i++) {
      processes[i] = new Process(i, i == 0);
      processes[i].start();
    }

    for (Process p : processes) {
      try {
        p.join();
      } catch (InterruptedException ignored) {
      }
    }

    System.out.println("All processes have terminated.");
  }
}`,
        },
      ],
      run_instructions: [
        "javac TerminationDetection.java",
        "java TerminationDetection",
      ],
    },
    {
      id: 8,
      title: "Assignment 8",
      topic: "Dynamic Name Server (DNS Lookup)",
      files: [
        {
          file_name: "DynamicNameServer.java",
          language: "Java",
          code: `import java.io.*;
import java.net.*;

public class DynamicNameServer {
  public static void main(String[] args) {
    final int PORT = 5000;

    try (ServerSocket serverSocket = new ServerSocket(PORT)) {
      System.out.println("Name Server started on port " + PORT);

      while (true) {
        Socket socket = serverSocket.accept();
        System.out.println("Client connected: " + socket.getInetAddress());

        BufferedReader in = new BufferedReader(new InputStreamReader(socket.getInputStream()));
        PrintWriter out = new PrintWriter(socket.getOutputStream(), true);

        String domain = in.readLine();
        if (domain == null || domain.trim().isEmpty()) {
          out.println("Invalid domain name.");
          continue;
        }

        try {
          InetAddress inetAddress = InetAddress.getByName(domain);
          String resolvedIP = inetAddress.getHostAddress();
          System.out.println("Resolved " + domain + " -> " + resolvedIP);
          out.println("Resolved IP Address: " + resolvedIP);
        } catch (UnknownHostException e) {
          System.out.println("Could not resolve domain: " + domain);
          out.println("Error: Could not resolve domain " + domain);
        }

        socket.close();
      }
    } catch (IOException e) {
      System.err.println("Server Error: " + e.getMessage());
      e.printStackTrace();
    }
  }
}`,
        },
        {
          file_name: "DynamicNameClient.java",
          language: "Java",
          code: `import java.io.*;
import java.net.*;

public class DynamicNameClient {
  public static void main(String[] args) {
    final String SERVER_IP = "localhost";
    final int SERVER_PORT = 5000;

    try (
      Socket socket = new Socket(SERVER_IP, SERVER_PORT);
      BufferedReader userInput = new BufferedReader(new InputStreamReader(System.in));
      BufferedReader in = new BufferedReader(new InputStreamReader(socket.getInputStream()));
      PrintWriter out = new PrintWriter(socket.getOutputStream(), true)
    ) {
      System.out.print("Enter domain name (e.g., www.google.com): ");
      String domain = userInput.readLine();
      out.println(domain);

      String response = in.readLine();
      System.out.println("Server Response: " + response);
    } catch (IOException e) {
      System.err.println("Client Error: " + e.getMessage());
      e.printStackTrace();
    }
  }
}`,
        },
      ],
      run_instructions: [
        "javac DynamicNameServer.java DynamicNameClient.java",
        "In terminal 1 run: java DynamicNameServer",
        "In terminal 2 run: java DynamicNameClient",
      ],
    },
    {
      id: 9,
      title: "Assignment 9",
      topic: "JMS/ESB with ActiveMQ and REST",
      files: [
        {
          file_name: "ESBRoute.java",
          language: "Java",
          code: "// Code not provided. Open from zip file in IntelliJ.",
        },
        {
          file_name: "MessageSubscriber.java",
          language: "Java",
          code: "// Code not provided. Open from zip file in IntelliJ.",
        },
        {
          file_name: "MessageWebService.java",
          language: "Java",
          code: "// Code not provided. Open from zip file in IntelliJ.",
        },
      ],
      run_instructions: [
        "Start ActiveMQ: navigate to the bin folder and run ./activemq start (web console: http://localhost:8161/admin)",
        "Open the assignment project zip in IntelliJ as a new project",
        "Configure Maven: run mvn clean install",
        "Run ESBRoute.java (main method)",
        "Create two run configurations for MessageSubscriber.java: Sub1 and Sub2",
        "Run MessageWebService.java (REST endpoint at http://localhost:8080/publish)",
      ],
      download: {
        label: "Download Project ZIP",
        href: "/Exp-9.zip",
        description:
          "Full IntelliJ project for Assignment 9 (located in public/Exp-9.zip)",
      },
    },
  ],
};
