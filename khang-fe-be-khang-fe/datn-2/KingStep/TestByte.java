public class TestByte {
    public static void main(String[] args) {
        byte b = -1;
        System.out.println("Result without mask: " + String.format("%02x", b));
        System.out.println("Result with mask: " + String.format("%02x", b & 0xff));
    }
}
